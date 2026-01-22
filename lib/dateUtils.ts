export function getISOWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekDayRange(year: number, weekNum: number): string {
    // Jan 4th is always in week 1
    const simple = new Date(year, 0, 4);
    const day = simple.getDay() || 7; // ISO week day 1-7
    const isoWeekStart = simple.getTime() - ((simple.getDay() || 7) - 1) * 86400000;

    // Correct logic:
    // week 1 starts on the Monday that contains Jan 4th?
    // Actually simpler: 
    // Get year start, find first Thursday.
    // Monday of that week is Start of Week 1.
    // Add (weekNum - 1) * 7 days.

    // Alternative approach using date-fns logic manually:
    const d = new Date(Date.UTC(year, 0, 4)); // Jan 4th
    const week1Start = new Date(d);
    week1Start.setUTCDate(d.getUTCDate() - (d.getUTCDay() || 7) + 1); // Monday of W1

    const targetMonday = new Date(week1Start);
    targetMonday.setUTCDate(week1Start.getUTCDate() + (weekNum - 1) * 7);

    const targetSunday = new Date(targetMonday);
    targetSunday.setUTCDate(targetMonday.getUTCDate() + 6);

    const formatDay = (date: Date) => `${date.getUTCDate()}`; // Just day number for compactness

    // Helper to format with month if crossing boundary?
    // Current UI just shows "4-10".

    return `${formatDay(targetMonday)}-${formatDay(targetSunday)}`;
}
