import { TIMETABLE_CONSTANTS } from '../constants/timetable.constants'

export const timeCalculations = {
  // 기존 함수들 (timetableTransformers.ts에서 이미 구현됨)
  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  },

  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  },

  // ✅ TIMETABLE_CONSTANTS 사용한 슬롯 인덱스 계산
  calculateSlotIndex: (time: string, startHour: number): number => {
    const minutes = timeCalculations.timeToMinutes(time)
    const startMinutes = startHour * 60
    return Math.floor((minutes - startMinutes) / TIMETABLE_CONSTANTS.TIME_INTERVAL)
  },

  // ✅ TIMETABLE_CONSTANTS 사용한 높이 계산 (픽셀 단위)
  calculateHeight: (startTime: string, endTime: string, startHour: number): number => {
    // 실제 시간 간격을 분 단위로 계산
    const startMinutes = timeCalculations.timeToMinutes(startTime)
    const endMinutes = timeCalculations.timeToMinutes(endTime)
    const durationMinutes = endMinutes - startMinutes
    
    // 정확한 슬롯 수 계산 (올림이 아닌 정확한 비율)
    const slotCount = durationMinutes / TIMETABLE_CONSTANTS.TIME_INTERVAL
    
    // TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX에서 'px' 제거하고 숫자로 변환
    const slotHeightPx = parseInt(TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX)
    return slotCount * slotHeightPx
  }
}
