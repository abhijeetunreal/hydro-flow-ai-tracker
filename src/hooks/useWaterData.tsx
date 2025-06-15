
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

const STORAGE_KEY = 'aquaTrackHistoryV2';

type Log = {
  amount: number;
  time: string;
};

type History = {
  [date: string]: Log[];
};

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

const useWaterData = () => {
  const dailyGoal = 3000;
  const [history, setHistory] = useState<History>({});

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setHistory(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      setHistory({});
    }
  }, []);

  const saveData = useCallback((newHistory: History) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  }, []);

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
    saveData(newHistory);

    if (newIntake >= dailyGoal && !wasGoalMetBefore) {
      const newStreak = calculateStreak(newHistory, dailyGoal);
      toast.success("🎉 Goal reached! You're awesome!", {
        description: `You're on a ${newStreak}-day streak!`,
      });
    }
  }, [currentIntake, dailyGoal, history, saveData]);
  
  return { currentIntake, dailyGoal, addWater, streak, history, todaysLogs };
};

export default useWaterData;
