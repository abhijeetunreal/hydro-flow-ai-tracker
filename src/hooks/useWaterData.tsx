
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const getToday = () => new Date().toISOString().split('T')[0];

const useWaterData = () => {
  const dailyGoal = 3000; // 3000ml = 3L
  const [currentIntake, setCurrentIntake] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastLogDate, setLastLogDate] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('waterTrackerData');
    if (savedData) {
      const { intake, streak, date } = JSON.parse(savedData);
      const today = getToday();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (date === today) {
        setCurrentIntake(intake);
        setStreak(streak);
      } else if (date === yesterday && intake >= dailyGoal) {
        // Continue streak
        setCurrentIntake(0);
        setStreak(streak);
      } else if (date === yesterday && intake < dailyGoal) {
        // Reset streak
        setCurrentIntake(0);
        setStreak(0);
        toast.info("Streak reset! Let's start a new one today.");
      } else {
        // day was missed
        setCurrentIntake(0);
        setStreak(0);
      }
      setLastLogDate(date);
    }
  }, []);

  const saveData = (intake: number, currentStreak: number) => {
    const today = getToday();
    const newData = { intake, streak: currentStreak, date: today };
    localStorage.setItem('waterTrackerData', JSON.stringify(newData));
  };

  const addWater = (amount: number) => {
    const newIntake = currentIntake + amount;
    const wasGoalMet = currentIntake < dailyGoal;
    
    setCurrentIntake(newIntake);
    let newStreak = streak;

    if (newIntake >= dailyGoal && wasGoalMet) {
      newStreak = lastLogDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? streak + 1 : 1;
      setStreak(newStreak);
      toast.success("🎉 Goal reached! You're awesome!", {
        description: `You've started a ${newStreak}-day streak!`,
      });
    }
    
    saveData(newIntake, newStreak);
  };
  
  return { currentIntake, dailyGoal, addWater, streak };
};

export default useWaterData;
