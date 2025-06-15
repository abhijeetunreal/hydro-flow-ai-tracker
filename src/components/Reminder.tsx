
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Plus, Edit, Trash2 } from 'lucide-react';
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

const REMINDER_KEY = 'hydration-reminders';
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_OF_WEEK = [
  { label: 'Mo', value: 1 },
  { label: 'Tu', value: 2 },
  { label: 'We', value: 3 },
  { label: 'Th', value: 4 },
  { label: 'Fr', value: 5 },
  { label: 'Sa', value: 6 },
  { label: 'Su', value: 0 },
];

export interface ReminderType {
  id: string;
  time: string;
  repeat: 'once' | 'daily' | 'custom';
  days: number[];
  label: string;
  enabled: boolean;
}

const defaultReminderValues: Omit<ReminderType, 'id'> = {
  time: '09:00',
  repeat: 'daily',
  days: [],
  label: 'Drink Water',
  enabled: true,
};

const Reminder = () => {
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderType | null>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const scheduleNextNotification = (remindersToSchedule: ReminderType[]) => {
    if (notificationTimeout.current) {
      clearTimeout(notificationTimeout.current);
    }
    if (!("Notification" in window)) return;

    let nextNotification: { date: Date; reminder: ReminderType } | null = null;

    const enabledReminders = remindersToSchedule.filter(r => r.enabled);

    for (const reminder of enabledReminders) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      for (let i = 0; i < 8; i++) {
        const checkDate = new Date();
        checkDate.setDate(new Date().getDate() + i);
        checkDate.setHours(hours, minutes, 0, 0);

        if (checkDate <= new Date()) continue;

        let isValid = false;
        if (reminder.repeat === 'daily') {
          isValid = true;
        } else if (reminder.repeat === 'once') {
           if (i < 2) isValid = true;
        } else if (reminder.repeat === 'custom' && reminder.days.length > 0) {
          if (reminder.days.includes(checkDate.getDay())) {
            isValid = true;
          }
        }
        
        if (isValid) {
          if (!nextNotification || checkDate < nextNotification.date) {
            nextNotification = { date: checkDate, reminder };
          }
          break; 
        }
      }
    }

    if (nextNotification) {
      const timeToNotification = nextNotification.date.getTime() - new Date().getTime();
      notificationTimeout.current = setTimeout(() => {
        new Notification(`💧 ${nextNotification.reminder.label || 'Time to Hydrate!'}`, {
          body: "Don't forget to drink some water.",
          icon: '/favicon.ico',
        });
        
        const newReminders = [...reminders];
        if (nextNotification.reminder.repeat === 'once') {
            const reminderIndex = newReminders.findIndex(r => r.id === nextNotification.reminder.id);
            if(reminderIndex !== -1) {
                newReminders[reminderIndex].enabled = false;
            }
        }
        
        // This will trigger a re-schedule via useEffect
        setReminders(newReminders);
      }, timeToNotification);
    }
  };

  useEffect(() => {
    const savedReminders = localStorage.getItem(REMINDER_KEY);
    if (savedReminders) {
        try {
            setReminders(JSON.parse(savedReminders));
        } catch (e) {
            console.error("Failed to parse reminders from localStorage", e);
            localStorage.removeItem(REMINDER_KEY);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
    scheduleNextNotification(reminders);

    return () => {
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, [reminders]);


  const requestNotificationPermission = (callback: () => void) => {
    if (!("Notification" in window)) {
        toast.error("This browser does not support desktop notification.");
        return;
    }
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
  
  const handleSaveReminder = () => {
    if (!editingReminder) return;
    if (!editingReminder.time) {
      toast.error("Please select a time for the reminder.");
      return;
    }
    if (editingReminder.repeat === 'custom' && editingReminder.days.length === 0) {
      toast.error("Please select at least one day for custom reminders.");
      return;
    }

    requestNotificationPermission(() => {
      const isEditing = reminders.some(r => r.id === editingReminder.id);
      let newReminders;
      if (isEditing) {
        newReminders = reminders.map(r => r.id === editingReminder.id ? editingReminder : r);
      } else {
        newReminders = [...reminders, editingReminder];
      }
      setReminders(newReminders);
      toast.success("Reminder has been saved successfully!");
      setIsSheetOpen(false);
      setEditingReminder(null);
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast.info("Reminder deleted.");
    setIsSheetOpen(false);
    setEditingReminder(null);
  };
  
  const handleDayToggle = (dayValue: string) => {
    if (!editingReminder) return;
    const dayNum = Number(dayValue);
    const newDays = editingReminder.days.includes(dayNum) 
        ? editingReminder.days.filter(d => d !== dayNum) 
        : [...editingReminder.days, dayNum];
    setEditingReminder({ ...editingReminder, days: newDays });
  };
  
  const handleOpenNew = () => {
    setEditingReminder({
      id: `reminder-${Date.now()}`,
      ...defaultReminderValues
    });
    setIsSheetOpen(true);
  }
  
  const handleOpenEdit = (reminder: ReminderType) => {
    setEditingReminder({ ...reminder });
    setIsSheetOpen(true);
  }

  const handleToggleEnable = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };
  
  const formatReminderText = (reminder: ReminderType) => {
    const d = new Date(`1970-01-01T${reminder.time}`);
    const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (reminder.repeat) {
        case 'daily': return `Daily at ${timeString}`;
        case 'once': return `Once at ${timeString}`;
        case 'custom':
            const dayStr = reminder.days.sort((a, b) => a - b).map(d => WEEK_DAYS[d]).join(', ');
            return `${dayStr.length > 0 ? dayStr : 'No days selected'} at ${timeString}`;
        default: return `Reminder set`;
    }
  }

  return (
    <div className="w-full">
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        if (!open) setEditingReminder(null);
        setIsSheetOpen(open);
      }}>
        <SheetContent>
            {editingReminder && (
            <>
                <SheetHeader>
                  <SheetTitle>{reminders.some(r => r.id === editingReminder.id) ? 'Edit Reminder' : 'Set Hydration Reminder'}</SheetTitle>
                  <SheetDescription>
                    Choose a time and how often you want to be reminded.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reminder-label" className="text-right">Label</Label>
                      <Input id="reminder-label" value={editingReminder.label} onChange={(e) => setEditingReminder({...editingReminder, label: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reminder-time" className="text-right">Time</Label>
                    <Input id="reminder-time" type="time" value={editingReminder.time} onChange={(e) => setEditingReminder({...editingReminder, time: e.target.value})} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="repeat-select" className="text-right">Repeat</Label>
                    <Select value={editingReminder.repeat} onValueChange={(val: ReminderType['repeat']) => setEditingReminder({...editingReminder, repeat: val})}>
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
                  {editingReminder.repeat === 'custom' && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Days</Label>
                       <div className="col-span-3 flex flex-wrap gap-1">
                        {DAYS_OF_WEEK.map((day) => (
                          <Button
                              key={day.value}
                              variant={editingReminder.days.includes(day.value) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleDayToggle(String(day.value))}
                              className="h-8 w-8 p-0"
                          >
                              {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <SheetFooter className="pt-4">
                  <div className="flex w-full justify-between">
                    {reminders.some(r => r.id === editingReminder.id) ? 
                        <Button type="button" variant="destructive" onClick={() => handleDeleteReminder(editingReminder.id)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button> : <div />}
                    <div className="flex gap-2">
                        <SheetClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </SheetClose>
                        <Button type="submit" onClick={handleSaveReminder}>Save</Button>
                    </div>
                  </div>
                </SheetFooter>
            </>
            )}
        </SheetContent>
      </Sheet>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center"><Bell className="mr-2 h-5 w-5"/> Reminders</h3>
            <Button onClick={handleOpenNew} size="sm"><Plus className="mr-2 h-4 w-4"/> Add New</Button>
        </div>
        {reminders.length > 0 ? (
            <div className="space-y-2">
                {reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground">
                        <div className="flex items-center gap-4">
                            <Button
                                size="sm"
                                variant={reminder.enabled ? 'default' : 'secondary'}
                                onClick={() => handleToggleEnable(reminder.id)}
                                className="w-20"
                            >
                                {reminder.enabled ? 'Enabled' : 'Disabled'}
                            </Button>
                            <div>
                                <p className="font-semibold">{reminder.label}</p>
                                <p className="text-sm text-muted-foreground">{formatReminderText(reminder)}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(reminder)}>
                            <Edit className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                <p>No reminders set.</p>
                <Button variant="link" onClick={handleOpenNew}>Create your first reminder</Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Reminder;
