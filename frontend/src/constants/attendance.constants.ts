export const ATTENDANCE_CONSTANTS = {
  GRID: {
    COLUMNS: 6,
    ROWS: 8,
    GAP: '8px',
    TOTAL_SEATS: 48
  },
  STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    UNKNOWN: 'unknown'
  },
  VARIANTS: {
    PRESENT: 'primary',
    ABSENT: 'danger',
    LATE: 'secondary',
    UNKNOWN: 'ghost'
  },
  ANIMATION: {
    DURATION: 200,
    SCALE: 1.02
  }
} as const

export const ATTENDANCE_MESSAGES = {
  SUCCESS: {
    SAVED: '출결 정보가 저장되었습니다.',
    UPDATED: '출결 정보가 업데이트되었습니다.',
    RESET: '모든 출결 정보가 초기화되었습니다.'
  },
  ERROR: {
    SAVE_FAILED: '출결 정보 저장에 실패했습니다.',
    LOAD_FAILED: '출결 정보 로드에 실패했습니다.',
    INVALID_STATUS: '유효하지 않은 출결 상태입니다.'
  },
  CONFIRM: {
    RESET: '모든 출결 정보를 초기화하시겠습니까?',
    DELETE: '선택한 출결 정보를 삭제하시겠습니까?'
  }
} as const

export const ATTENDANCE_COLORS = {
  PRESENT: '#4caf50',
  ABSENT: '#f44336',
  LATE: '#ff9800',
  UNKNOWN: '#9e9e9e'
} as const 