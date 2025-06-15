
```typescript
import React, { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const REMINDER_KEY = 'hydration-reminder';
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Reminder = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<{ time: string; repeat: string; days: number[] } | null>(null);
  const activeTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialLoad = useRef(true);

  // Form state
  const [reminderTime, setReminderTime] = useState('09:00');
  const [repeat, setRepeat] = useState('daily');
  const [customDays, setCustomDays] = useState<string[]>([]);

  const scheduleNextNotification = (reminder: { time: string; repeat: string; days: number[] }) => {
    if (activeTimeout.current) {
      clearTimeout(activeTimeout.current);
    }
    if (!("Notification" in window)) return;

    const getNextReminderDate = (): Date | null => {
      const now = new Date();
      const [hours, minutes] = reminder.time.split(':').map(Number);

      for (let i = 0; i < 8; i++) {
        const checkDate = new Date();
        checkDate.setDate(now.getDate() + i);
        checkDate.setHours(hours, minutes, 0, 0);

        if (checkDate <= now) continue;

        if (reminder.repeat === 'once' || reminder.repeat === 'daily') {
           if (i < 2) return checkDate; // Only check today and tomorrow for once/daily
        }
        
        if (reminder.repeat === 'custom' && reminder.days.length > 0) {
          if (reminder.days.includes(checkDate.getDay())) {
            return checkDate;
          }
        }
      }
      return null;
    };

    const nextReminderDate = getNextReminderDate();

    if (nextReminderDate) {
      const timeToReminder = nextReminderDate.getTime() - new Date().getTime();
      activeTimeout.current = setTimeout(() => {
        new Notification("💧 Time to Hydrate!", {
          body: "Don't forget to drink some water.",
          icon: '/favicon.ico',
        });
        if (reminder.repeat !== 'once') {
          scheduleNextNotification(reminder);
        } else {
            handleCancelReminder(false);
        }
      }, timeToReminder);
    }
  };

  useEffect(() => {
    if (initialLoad.current && typeof window !== 'undefined') {
      const savedReminder = localStorage.getItem(REMINDER_KEY);
      if (savedReminder) {
        try {
            const parsed = JSON.parse(savedReminder);
            setActiveReminder(parsed);
            scheduleNextNotification(parsed);
        } catch (e) {
            console.error("Failed to parse reminder from localStorage", e);
            localStorage.removeItem(REMINDER_KEY);
        }
      }
      initialLoad.current = false;
    }
    return () => {
        if (activeTimeout.current) clearTimeout(activeTimeout.current);
    }
  }, []);

  const handleSetReminder = () => {
    if (!reminderTime) {
      toast.error("Please select a time for the reminder.");
      return;
    }
    if (repeat === 'custom' && customDays.length === 0) {
      toast.error("Please select at least one day for custom reminders.");
      return;
    }

    const newReminder = {
      time: reminderTime,
      repeat,
      days: customDays.map(Number),
    };
    
    const requestNotificationPermission = (callback: () => void) => {
        if (Notification.permission === "granted") {
            callback();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    callback();
                } else {
                    toast.warning("Notification permission denied. Cannot set reminder.");
                }
            });
        } else {
            toast.warning("Permissions denied. Please enable notifications in browser settings.");
        }
    }

    requestNotificationPermission(() => {
        localStorage.setItem(REMINDER_KEY, JSON.stringify(newReminder));
        setActiveReminder(newReminder);
        scheduleNextNotification(newReminder);
        toast.success("Reminder has been saved successfully!");
        setIsSheetOpen(false);
    });
  };

  const handleCancelReminder = (showToast = true) => {
    if (activeTimeout.current) {
      clearTimeout(activeTimeout.current);
    }
    localStorage.removeItem(REMINDER_KEY);
    setActiveReminder(null);
    if(showToast) toast.info("Reminder cancelled.");
    setIsSheetOpen(false);
  };
  
  const handleDayToggle = (day: string) => {
    setCustomDays(prev => 
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const openSheet = () => {
    if (activeReminder) {
      setReminderTime(activeReminder.time);
      setRepeat(activeReminder.repeat);
      setCustomDays(activeReminder.days.map(String));
    } else {
      // Reset to default when setting a new reminder
      setReminderTime('09:00');
      setRepeat('daily');
      setCustomDays([]);
    }
    setIsSheetOpen(true);
  }

  const formatReminderText = (reminder: { time: string; repeat: string; days: number[] }) => {
    const d = new Date(`1970-01-01T${reminder.time}`);
    const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (reminder.repeat) {
        case 'daily': return `Daily at ${timeString}`;
        case 'once': return `Once at ${timeString}`;
        case 'custom':
            const dayStr = reminder.days.sort().map(d => WEEK_DAYS[d]).join(', ');
            return `${dayStr} at ${timeString}`;
        default: return `Reminder set`;
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full" onClick={openSheet}>
          <Bell className="mr-2 h-4 w-4" />
          {activeReminder ? formatReminderText(activeReminder) : 'Set a Reminder'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{activeReminder ? 'Edit Reminder' : 'Set Hydration Reminder'}</SheetTitle>
          <SheetDescription>
            Choose a time and how often you want to be reminded.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reminder-time" className="text-right">Time</Label>
            <Input id="reminder-time" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repeat-select" className="text-right">Repeat</Label>
            <Select value={repeat} onValueChange={setRepeat}>
                <SelectTrigger id="repeat-select" className="col-span-3">
                    <SelectValue placeholder="Select repeat interval" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Every Day</SelectItem>
                    <SelectItem value="custom">Custom Days</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {repeat === 'custom' && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Days</Label>
               <div className="col-span-3 flex flex-wrap gap-1">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => {
                    const dayValue = day === 'Su' ? 0 : index + 1;
                    return (
                        <Button
                            key={day}
                            variant={customDays.includes(String(dayValue)) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleDayToggle(String(dayValue))}
                            className="h-8 w-8 p-0"
                        >
                            {day}
                        </Button>
                    )
                })}
              </div>
            </div>
          )}
        </div>
        <SheetFooter className="pt-4">
          <div className="flex w-full justify-between">
            {activeReminder ? 
                <Button type="button" variant="destructive" onClick={() => handleCancelReminder()}>Delete</Button> : <div />}
            <div className="flex gap-2">
                <SheetClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </SheetClose>
                <Button type="submit" onClick={handleSetReminder}>Save</Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default Reminder;
```
