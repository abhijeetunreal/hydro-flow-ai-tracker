import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import * as driveService from '@/services/driveService';
import { ReminderType } from '@/components/Reminder';

const BASE_STORAGE_KEY = 'aquaTrackHistoryV3';

type Log = {
  amount: number;
  time: string;
};

type History = {
  [date: string]: Log[];
};

type StoredData = {
  history: History;
  reminders: ReminderType[];
  lastModified: string;
};

interface UserProfile {
  email: string;
}

const getTodayString = () => format(new Date(), 'yyyy-MM-dd');

const calculateStreak = (history: History, dailyGoal: number): number => {
  if (!history || Object.keys(history).length === 0) return 0;

  let streak = 0;
  let checkDate = new Date();
  
  // First, check if today's goal is met. If not, the current streak displayed should be the one ending yesterday.
  const todayStr = format(checkDate, 'yyyy-MM-dd');
  const todayIntake = history[todayStr]?.reduce((sum, log) => sum + log.amount, 0) || 0;

  if (todayIntake < dailyGoal) {
    checkDate = subDays(checkDate, 1);
  }

  // Now, count backwards from checkDate
  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const dayIntake = history[dateStr]?.reduce((sum, log) => sum + log.amount, 0) || 0;

    if (dayIntake >= dailyGoal) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

const useWaterData = (user: UserProfile | null) => {
  const { accessToken } = useAuth();
  const dailyGoal = 3000;
  const [history, setHistory] = useState<History>({});
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [driveFile, setDriveFile] = useState<driveService.DriveFile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const storageKey = useMemo(() => {
    return user?.email ? `${BASE_STORAGE_KEY}_${user.email}` : null;
  }, [user]);

  const getLocalData = useCallback((): StoredData | null => {
    if (!storageKey) return null;
    const localData = localStorage.getItem(storageKey);
    return localData ? JSON.parse(localData) : null;
  }, [storageKey]);

  const setData = useCallback((data: StoredData) => {
    setHistory(data.history);
    setReminders(data.reminders || []);
    setLastModified(data.lastModified);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  }, [storageKey]);

  const syncToDrive = useCallback(async (data: StoredData) => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      if (driveFile?.id) {
        await driveService.updateDataFile(accessToken, driveFile.id, data);
      } else {
        const newFile = await driveService.createDataFile(accessToken, data);
        if (newFile) setDriveFile(newFile);
      }
    } catch (error) {
      console.error("Sync to drive failed", error);
    } finally {
      setIsSyncing(false);
    }
  }, [accessToken, driveFile]);

  useEffect(() => {
    if (!accessToken || !storageKey) {
        setHistory({});
        setReminders([]);
        setLastModified(null);
        return;
    };

    const initialSync = async () => {
      setIsSyncing(true);
      const remoteFile = await driveService.findDataFile(accessToken);
      const localData = getLocalData();
      
      if (remoteFile) {
        setDriveFile(remoteFile);
        const remoteData = await driveService.readFileContent(accessToken, remoteFile.id);
        
        if (remoteData) {
            if (!localData || isAfter(parseISO(remoteData.lastModified), parseISO(localData.lastModified))) {
              setData(remoteData);
            } else if (isAfter(parseISO(localData.lastModified), parseISO(remoteData.lastModified))) {
              await syncToDrive(localData);
            } else {
              setData(localData);
            }
        } else if (localData) {
            await syncToDrive(localData);
        }

      } else if (localData) {
        await syncToDrive(localData);
      } else {
        const initialData: StoredData = { history: {}, reminders: [], lastModified: new Date().toISOString() };
        setData(initialData);
        await syncToDrive(initialData);
      }
      setIsSyncing(false);
    };

    initialSync();
  }, [accessToken, storageKey, getLocalData, setData, syncToDrive]);

  const { currentIntake, todaysLogs, streak } = useMemo(() => {
    const todayStr = getTodayString();
    const localTodaysLogs = history[todayStr] || [];
    const localCurrentIntake = localTodaysLogs.reduce((sum, log) => sum + log.amount, 0);
    const localStreak = calculateStreak(history, dailyGoal);

    return {
      currentIntake: localCurrentIntake,
      todaysLogs: localTodaysLogs,
      streak: localStreak,
    };
  }, [history, dailyGoal]);

  const addWater = useCallback((amount: number) => {
    const wasGoalMetBefore = currentIntake >= dailyGoal;
    const newIntake = currentIntake + amount;

    const todayStr = getTodayString();
    const newLog: Log = { amount, time: new Date().toISOString() };
    const updatedTodaysLogs = [...(history[todayStr] || []), newLog];
    
    const newHistory = { ...history, [todayStr]: updatedTodaysLogs };
    const newData: StoredData = { history: newHistory, reminders, lastModified: new Date().toISOString() };
    
    setData(newData);
    syncToDrive(newData);

    if (newIntake >= dailyGoal && !wasGoalMetBefore) {
      const newStreak = calculateStreak(newHistory, dailyGoal);
      toast.success("🎉 Goal reached! You're awesome!", {
        description: `You're on a ${newStreak}-day streak!`,
      });
    }
  }, [currentIntake, dailyGoal, history, reminders, setData, syncToDrive]);
  
  const saveReminder = useCallback((reminderToSave: ReminderType) => {
    const isEditing = reminders.some(r => r.id === reminderToSave.id);
    let newReminders;
    if (isEditing) {
      newReminders = reminders.map(r => r.id === reminderToSave.id ? reminderToSave : r);
    } else {
      newReminders = [...reminders, reminderToSave];
    }
    
    const newData: StoredData = { history, reminders: newReminders, lastModified: new Date().toISOString() };
    setData(newData);
    syncToDrive(newData);
    toast.success("Reminder saved!");
  }, [history, reminders, setData, syncToDrive]);

  const deleteReminder = useCallback((reminderId: string) => {
    const newReminders = reminders.filter(r => r.id !== reminderId);
    const newData: StoredData = { history, reminders: newReminders, lastModified: new Date().toISOString() };
    setData(newData);
    syncToDrive(newData);
    toast.info("Reminder deleted.");
  }, [history, reminders, setData, syncToDrive]);

  return { currentIntake, dailyGoal, addWater, streak, history, todaysLogs, isSyncing, reminders, saveReminder, deleteReminder };
};

export default useWaterData;
