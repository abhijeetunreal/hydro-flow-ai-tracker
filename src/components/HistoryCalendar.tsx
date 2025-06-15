
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
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-full">
          {dateRange.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const intake = history[dateStr]?.reduce((sum, log) => sum + log.amount, 0) || 0;
            const percentage = Math.min(intake / dailyGoal, 1);
            
            const style = intake > 0
              ? { backgroundColor: `hsla(205, 90%, 50%, ${percentage * 0.8 + 0.2})` }
              : { backgroundColor: 'hsl(var(--muted) / 0.3)' };

            return (
              <Tooltip key={index} delayDuration={100}>
                <TooltipTrigger>
                  <div className={`w-full aspect-square rounded-sm`} style={style} />
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

