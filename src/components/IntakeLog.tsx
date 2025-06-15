
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

type Log = {
  amount: number;
  time: string;
};

interface IntakeLogProps {
  logs: Log[];
}

const IntakeLog: React.FC<IntakeLogProps> = ({ logs }) => {
  if (logs.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Log</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {logs.slice().reverse().map((log, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>+{log.amount}ml</span>
              <span>{format(new Date(log.time), 'p')}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default IntakeLog;
