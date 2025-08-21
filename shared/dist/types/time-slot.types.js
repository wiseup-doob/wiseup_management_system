export const TIME_SLOT_TYPES = {
    REGULAR_CLASS: 'regular_class', // 정규 수업
    BREAK: 'break', // 쉬는 시간
    LUNCH: 'lunch', // 점심 시간
    SELF_STUDY: 'self_study', // 자율학습
    SPECIAL_ACTIVITY: 'special_activity' // 특별 활동
};
// 시간 형식 검증을 위한 정규식
export const TIME_FORMAT_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
// 시간 비교를 위한 유틸리티 함수
export function isTimeValid(time) {
    return TIME_FORMAT_REGEX.test(time);
}
export function compareTimes(time1, time2) {
    if (!isTimeValid(time1) || !isTimeValid(time2)) {
        throw new Error('잘못된 시간 형식입니다. HH:MM 형식을 사용해주세요.');
    }
    const [hour1, minute1] = time1.split(':').map(Number);
    const [hour2, minute2] = time2.split(':').map(Number);
    const totalMinutes1 = hour1 * 60 + minute1;
    const totalMinutes2 = hour2 * 60 + minute2;
    return totalMinutes1 - totalMinutes2;
}
//# sourceMappingURL=time-slot.types.js.map