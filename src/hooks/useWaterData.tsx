import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import * as driveService from '@/services/driveService';
import * as calendarService from '@/services/calendarService';
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
  const [calendarId, setCalendarId] = useState<string | null>(null);
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
      let dataToSet: StoredData | null = null;
      let syncLocalToRemote = false;

      if (remoteFile) {
        setDriveFile(remoteFile);
        const remoteData = await driveService.readFileContent(accessToken, remoteFile.id);
        if (remoteData) {
          dataToSet = remoteData;
        }
      }

      if (!dataToSet) {
        const localData = getLocalData();
        if (localData) {
          dataToSet = localData;
          syncLocalToRemote = true;
        }
      }
      
      if (dataToSet) {
        setData(dataToSet);
        if (syncLocalToRemote) {
          await syncToDrive(dataToSet);
        }
      } else {
        const initialData: StoredData = { history: {}, reminders: [], lastModified: new Date().toISOString() };
        setData(initialData);
        await syncToDrive(initialData);
      }

      const calId = await calendarService.findOrCreateCalendar(accessToken);
      if (calId) {
        setCalendarId(calId);
      } else {
        toast.error("Could not connect to Google Calendar. Reminders will not work.");
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
    // syncToDrive(newData); // Removed to prevent sync on every log

    if (newIntake >= dailyGoal && !wasGoalMetBefore) {
      const newStreak = calculateStreak(newHistory, dailyGoal);
      toast.success("🎉 Goal reached! You're awesome!", {
        description: `You're on a ${newStreak}-day streak!`,
      });
    }
  }, [currentIntake, dailyGoal, history, reminders, setData]);
  
  const saveReminder = useCallback(async (reminderToSave: ReminderType) => {
    if (!accessToken || !calendarId) {
      toast.error("Cannot save reminder. Not connected to Google services.");
      return;
    }
    
    const isEditing = reminders.some(r => r.id === reminderToSave.id);
    
    const existingReminder = reminders.find(r => r.id === reminderToSave.id);
    if (existingReminder?.eventId) {
      await calendarService.deleteCalendarEvent(accessToken, calendarId, existingReminder.eventId);
    }
    
    let newEventId: string | null = null;
    if (reminderToSave.enabled) {
      newEventId = await calendarService.createCalendarEvent(accessToken, calendarId, reminderToSave);
      if (!newEventId) {
        toast.error("Failed to create reminder in Google Calendar.");
      }
    }
    
    const finalReminder = { ...reminderToSave, eventId: newEventId || undefined };

    const newReminders = isEditing 
      ? reminders.map(r => r.id === finalReminder.id ? finalReminder : r)
      : [...reminders, finalReminder];
    
    const newData: StoredData = { history, reminders: newReminders, lastModified: new Date().toISOString() };
    setData(newData);
    // await syncToDrive(newData); // Removed to prevent sync on every save
    toast.success("Reminder saved!");
  }, [history, reminders, setData, accessToken, calendarId]);

  const deleteReminder = useCallback(async (reminderId: string) => {
    if (!accessToken || !calendarId) {
      toast.error("Cannot delete reminder. Not connected to Google services.");
      return;
    }
    
    const reminderToDelete = reminders.find(r => r.id === reminderId);
    if (reminderToDelete?.eventId) {
      await calendarService.deleteCalendarEvent(accessToken, calendarId, reminderToDelete.eventId);
    }

    const newReminders = reminders.filter(r => r.id !== reminderId);
    const newData: StoredData = { history, reminders: newReminders, lastModified: new Date().toISOString() };
    setData(newData);
    // await syncToDrive(newData); // Removed to prevent sync on every delete
    toast.info("Reminder deleted.");
  }, [history, reminders, setData, accessToken, calendarId]);

  return { currentIntake, dailyGoal, addWater, streak, history, todaysLogs, isSyncing, reminders, saveReminder, deleteReminder };
};

export default useWaterData;
