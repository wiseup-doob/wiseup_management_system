// 좌석 관련 상수 정의
// 8x8 그리드로 64개 좌석을 고정적으로 관리
export const SEAT_CONFIG = {
  TOTAL_SEATS: 64,        // 총 좌석 수 (고정)
  ROWS: 8,                // 행 수 (고정)
  COLS: 8,                // 열 수 (고정)
  GRID_TYPE: '8x8'        // 그리드 타입 (고정)
} as const;

// 좌석 상태 상수
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance'
} as const;

// 좌석 ID 형식
export const SEAT_ID_FORMAT = 'seat_{number}' as const;

// 좌석 ID 생성 함수
export const generateSeatId = (seatNumber: number): string => {
  return SEAT_ID_FORMAT.replace('{number}', seatNumber.toString());
};
