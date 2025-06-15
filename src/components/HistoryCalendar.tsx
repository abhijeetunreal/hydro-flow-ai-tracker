
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfDay } from 'date-fns';

type Log = { amount: number; time: string };
type History = { [date: string]: Log[] };

interface HistoryCalendarProps {
  history: History;
  dailyGoal: number;
  streak: number;
}

const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ history, dailyGoal, streak }) => {
  const today = endOfDay(new Date());
  const daysToShow = 112; // 16 weeks
  const firstDay = startOfWeek(subDays(today, daysToShow - 1), { weekStartsOn: 1 });

  const dateRange = eachDayOfInterval({
    start: firstDay,
    end: today,
  });

  const getIntensity = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!history[dateStr]) return 0;
    const intake = history[dateStr].reduce((sum, log) => sum + log.amount, 0);
    if (intake === 0) return 0;
    if (intake >= dailyGoal) return 4;
    const percentage = intake / dailyGoal;
    if (percentage > 0.66) return 3;
    if (percentage > 0.33) return 2;
    return 1;
  };

  const intensityClasses = [
    'bg-muted/30', // 0
    'bg-primary/20', // 1
    'bg-primary/40', // 2
    'bg-primary/70', // 3
    'bg-primary',    // 4 (goal met)
  ];

  const weekDays = ['Mon', 'Wed', 'Fri'];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-sm font-medium">
          <span>Hydration Consistency</span>
          <span className="text-base font-bold text-primary">{streak} day streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex flex-col justify-between text-xs text-muted-foreground pt-4">
          {weekDays.map(day => <span key={day}>{day}</span>)}
        </div>
        <div className="grid grid-cols-16 grid-flow-col gap-1 w-full">
          {dateRange.map((date, index) => {
            const intensity = getIntensity(date);
            const intake = history[format(date, 'yyyy-MM-dd')]?.reduce((sum, log) => sum + log.amount, 0) || 0;
            return (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger>
                  <div className={`w-full aspect-square rounded-sm ${intensityClasses[intensity]}`} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(date, 'MMM d, yyyy')}: {intake}ml</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryCalendar;
