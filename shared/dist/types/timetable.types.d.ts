import type { DayOfWeek } from './common.types';
export interface CompleteTimetableData {
    studentId: string;
    studentName: string;
    grade: string;
    status: 'active' | 'inactive';
    classSections: Array<{
        id: string;
        name: string;
        teacher: {
            name: string;
        };
        classroom: {
            name: string;
        };
        schedule: Array<{
            dayOfWeek: DayOfWeek;
            startTime: string;
            endTime: string;
        }>;
        color: string;
    }>;
}
export interface TimetableApiResponse {
    success: boolean;
    message: string;
    data: CompleteTimetableData;
    meta?: {
        timestamp: string;
        requestId: string;
        classCount: number;
    };
}
//# sourceMappingURL=timetable.types.d.ts.map