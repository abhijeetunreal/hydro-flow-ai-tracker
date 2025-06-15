
import { ReminderType } from "@/components/Reminder";

const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_SUMMARY = 'AquaTrack Hydration';

const getApiHeaders = (accessToken: string) => ({
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
});

// Find or create the AquaTrack calendar
export const findOrCreateCalendar = async (accessToken: string): Promise<string | null> => {
    // 1. Check if calendar exists
    const response = await fetch(`${CALENDAR_API_URL}/users/me/calendarList`, {
        headers: getApiHeaders(accessToken),
    });
    if (!response.ok) {
        console.error("Failed to list calendars", await response.json());
        return null;
    }
    const { items: calendars } = await response.json();
    const existingCalendar = calendars.find((cal: any) => cal.summary === CALENDAR_SUMMARY);

    if (existingCalendar) {
        return existingCalendar.id;
    }

    // 2. Create calendar if it doesn't exist
    const createResponse = await fetch(`${CALENDAR_API_URL}/calendars`, {
        method: 'POST',
        headers: getApiHeaders(accessToken),
        body: JSON.stringify({ summary: CALENDAR_SUMMARY }),
    });

    if (!createResponse.ok) {
        console.error("Failed to create calendar", await createResponse.json());
        return null;
    }

    const newCalendar = await createResponse.json();
    return newCalendar.id;
};

const getRRule = (reminder: ReminderType) => {
    const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    switch (reminder.repeat) {
        case 'daily':
            return 'RRULE:FREQ=DAILY';
        case 'custom':
            if (reminder.days.length === 0) return null;
            const byday = reminder.days.sort().map(d => weekdays[d]).join(',');
            return `RRULE:FREQ=WEEKLY;BYDAY=${byday}`;
        default:
            return null;
    }
}

const convertReminderToEvent = (reminder: ReminderType) => {
    const now = new Date();
    const [hour, minute] = reminder.time.split(':').map(Number);
    
    // Set a start date for the event. For recurring events, if the time has passed for today, start tomorrow.
    const startDate = new Date();
    startDate.setHours(hour, minute, 0, 0);
    if (reminder.repeat !== 'once' && startDate < now) {
        startDate.setDate(startDate.getDate() + 1);
    }
    
    const endDate = new Date(startDate.getTime() + 5 * 60 * 1000); // 5 minute duration

    const event = {
        summary: `💧 ${reminder.label || 'Time to Hydrate!'}`,
        description: "Reminder from AquaTrack to drink water.",
        start: {
            dateTime: startDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: endDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 0 }],
        },
        recurrence: [] as string[],
    };

    const rrule = getRRule(reminder);
    if (rrule) {
        event.recurrence.push(rrule);
    }

    return event;
}

// Create a calendar event for a reminder
export const createCalendarEvent = async (accessToken: string, calendarId: string, reminder: ReminderType): Promise<string | null> => {
    const event = convertReminderToEvent(reminder);

    const response = await fetch(`${CALENDAR_API_URL}/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: getApiHeaders(accessToken),
        body: JSON.stringify(event),
    });

    if (!response.ok) {
        console.error("Failed to create calendar event", await response.json());
        return null;
    }
    
    const newEvent = await response.json();
    return newEvent.id as string;
};

// Delete a calendar event
export const deleteCalendarEvent = async (accessToken: string, calendarId: string, eventId: string): Promise<boolean> => {
    const response = await fetch(`${CALENDAR_API_URL}/calendars/${calendarId}/events/${eventId}`, {
        method: 'DELETE',
        headers: getApiHeaders(accessToken),
    });

    // 410 Gone is ok, means it was already deleted. 404 is also okay.
    if (!response.ok && ![410, 404].includes(response.status)) { 
         console.error("Failed to delete calendar event", await response.json());
         return false;
    }
    return true;
};
