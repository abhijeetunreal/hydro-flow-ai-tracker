import React, { useState } from 'react';
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

interface ReminderProps {
  reminders: ReminderType[];
  saveReminder: (reminder: ReminderType) => void;
  deleteReminder: (id: string) => void;
}

const Reminder: React.FC<ReminderProps> = ({ reminders, saveReminder, deleteReminder }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderType | null>(null);

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

    saveReminder(editingReminder);
    setIsSheetOpen(false);
    setEditingReminder(null);
  };

  const handleDelete = (id: string) => {
    deleteReminder(id);
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
    const reminder = reminders.find(r => r.id === id);
    if(reminder) {
        saveReminder({ ...reminder, enabled: !reminder.enabled });
    }
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
                    Set reminders and get browser notifications to stay hydrated.
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
                        <Button type="button" variant="destructive" onClick={() => handleDelete(editingReminder.id)}><Trash2 className="mr-2 h-4 w-4"/> Delete</Button> : <div />}
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
                    <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 text-card-foreground">
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
