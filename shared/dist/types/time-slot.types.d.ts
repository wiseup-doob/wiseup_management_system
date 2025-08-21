import type { BaseEntity, FirestoreTimestamp } from './common.types';
export interface TimeSlot extends BaseEntity {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    isBreak: boolean;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateTimeSlotRequest {
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    isBreak?: boolean;
}
export interface UpdateTimeSlotRequest {
    name?: string;
    startTime?: string;
    endTime?: string;
    order?: number;
    isBreak?: boolean;
}
export interface TimeSlotSearchParams {
    name?: string;
    startTime?: string;
    endTime?: string;
    order?: number;
    isBreak?: boolean;
    minOrder?: number;
    maxOrder?: number;
}
export interface TimeSlotStatistics {
    totalTimeSlots: number;
    breakTimeSlots: number;
    classTimeSlots: number;
    averageDuration: number;
    timeSlotsByOrder: Record<number, number>;
    mostUsedStartTimes: string[];
}
export declare const TIME_SLOT_TYPES: {
    readonly REGULAR_CLASS: "regular_class";
    readonly BREAK: "break";
    readonly LUNCH: "lunch";
    readonly SELF_STUDY: "self_study";
    readonly SPECIAL_ACTIVITY: "special_activity";
};
export type TimeSlotType = typeof TIME_SLOT_TYPES[keyof typeof TIME_SLOT_TYPES];
export declare const TIME_FORMAT_REGEX: RegExp;
export declare function isTimeValid(time: string): boolean;
export declare function compareTimes(time1: string, time2: string): number;
//# sourceMappingURL=time-slot.types.d.ts.map