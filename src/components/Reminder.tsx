
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Reminder = () => {
  const [reminderTime, setReminderTime] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSetReminder = () => {
    if (!reminderTime) {
      toast.error("Please select a time for the reminder.");
      return;
    }

    if (!("Notification" in window)) {
      toast.error("This browser does not support desktop notification.");
      return;
    }

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    if (reminderDate <= now) {
      // If time is in the past, set it for the next day
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    const timeToReminder = reminderDate.getTime() - now.getTime();

    const scheduleNotification = () => {
        if (timeToReminder > 0) {
            setTimeout(() => {
                new Notification("💧 Time to Hydrate!", {
                    body: "Don't forget to drink some water.",
                    icon: '/favicon.ico',
                });
            }, timeToReminder);
    
            toast.success(`Reminder set for ${reminderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
            setIsSheetOpen(false);
            setReminderTime('');
        } else {
            toast.error("An error occurred while setting the reminder.");
        }
    };


    if (Notification.permission === "granted") {
      scheduleNotification();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          scheduleNotification();
        } else {
          toast.warning("Notification permission denied. Cannot set reminder.");
        }
      });
    } else {
        toast.warning("Notification permission has been denied. Please enable it in your browser settings.");
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bell className="mr-2 h-4 w-4" /> Set a Reminder
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Set Hydration Reminder</SheetTitle>
          <SheetDescription>
            We'll send you a notification to remind you to drink water.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder-time" className="text-right">
              Time
            </Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
             <Button type="button" variant="secondary" onClick={() => setReminderTime('')}>Cancel</Button>
          </SheetClose>
          <Button type="submit" onClick={handleSetReminder}>Save Reminder</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Reminder;
