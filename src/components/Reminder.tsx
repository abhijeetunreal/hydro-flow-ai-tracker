
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

const Reminder = () => {
  const handleReminderClick = () => {
    toast.info("Reminder feature coming soon!", {
      description: "We'll help you stay consistent with notifications.",
    });
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleReminderClick}>
      <Bell className="mr-2 h-4 w-4" /> Set a Reminder
    </Button>
  );
};

export default Reminder;
