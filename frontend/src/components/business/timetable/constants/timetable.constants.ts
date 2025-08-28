// timeInterval을 30분으로 고정하는 상수 정의
export const TIMETABLE_CONSTANTS = {
  TIME_INTERVAL: 30,           // 30분 단위 고정
  SLOT_HEIGHT: 30,             // 30px (기존 60px의 절반)
  SLOT_HEIGHT_PX: '30px',      // CSS용 문자열
  SLOT_HEIGHT_CALC: 'calc(30px - 4px)' // 실제 셀 높이
} as const

// 요일 배열 상수
export const DAYS: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

// timeInterval prop은 여전히 존재하지만 기본값을 30으로 변경
