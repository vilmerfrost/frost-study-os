/**
 * Generate an ICS (iCalendar) file content for a schedule
 */
export function generateICS(schedule: {
    blocks: Array<{
        time: string;
        type: string;
        task: string;
        duration: number;
    }>;
    date?: Date;
}): string {
    const now = new Date();
    const scheduleDate = schedule.date || now;

    // Format: YYYYMMDDTHHmmssZ
    const formatICSDate = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Parse time string like "09:00" and create a Date for today
    const parseTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(scheduleDate);
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Frost Study OS//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    schedule.blocks.forEach((block, index) => {
        const startTime = parseTime(block.time);
        const endTime = new Date(startTime.getTime() + block.duration * 60000); // duration in minutes

        icsContent.push(
            'BEGIN:VEVENT',
            `UID:frost-study-${scheduleDate.getTime()}-${index}@frost-study-os.app`,
            `DTSTAMP:${formatICSDate(now)}`,
            `DTSTART:${formatICSDate(startTime)}`,
            `DTEND:${formatICSDate(endTime)}`,
            `SUMMARY:${block.type}: ${block.task}`,
            `DESCRIPTION:Energy-optimized ${block.type.toLowerCase()} block`,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');

    return icsContent.join('\r\n');
}

/**
 * Trigger download of ICS file
 */
export function downloadICS(content: string, filename: string = 'frost-study-plan.ics') {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
