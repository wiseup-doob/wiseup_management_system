import { SEAT_CONFIG, generateSeatId } from '../constants/seat.constants';
/**
 * 좌석 데이터 생성 (8x8 그리드, 64개 좌석)
 */
export function generateSeatData() {
    const seats = [];
    for (let i = 1; i <= SEAT_CONFIG.TOTAL_SEATS; i++) {
        seats.push({
            id: generateSeatId(i),
            seatId: generateSeatId(i),
            seatNumber: i,
            row: Math.floor((i - 1) / SEAT_CONFIG.COLS) + 1,
            col: ((i - 1) % SEAT_CONFIG.COLS) + 1,
            // ❌ studentId 제거 - seat_assignments에서 관리
            status: 'available',
            lastUpdated: new Date().toISOString(),
            notes: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    return seats;
}
/**
 * 좌석 그리드 생성 (8x8 그리드 기준)
 */
export function generateSeatGrid(totalSeats = SEAT_CONFIG.TOTAL_SEATS) {
    const seats = [];
    for (let i = 0; i < totalSeats; i++) {
        const seatNumber = i + 1;
        const row = Math.floor(i / SEAT_CONFIG.COLS) + 1; // 8열 기준
        const col = (i % SEAT_CONFIG.COLS) + 1;
        seats.push({
            id: generateSeatId(seatNumber),
            seatId: generateSeatId(seatNumber),
            seatNumber,
            row,
            col,
            // ❌ studentId 제거 - seat_assignments에서 관리
            status: 'available',
            lastUpdated: new Date().toISOString(),
            notes: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    return seats;
}
/**
 * 좌석 번호로 좌석 찾기
 */
export function findSeatByNumber(seats, seatNumber) {
    return seats.find(seat => seat.seatNumber === seatNumber);
}
/**
 * 좌석 ID로 좌석 찾기
 */
export function findSeatById(seats, seatId) {
    return seats.find(seat => seat.seatId === seatId);
}
/**
 * 학생 ID로 좌석 찾기 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export function findSeatByStudentId(_seats, _studentId) {
    // ❌ studentId 기반 검색 제거 - seat_assignments에서 조회해야 함
    console.warn('findSeatByStudentId 함수는 더 이상 사용하지 않습니다. seat_assignments에서 조회하세요.');
    return undefined;
}
/**
 * 좌석 할당 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 관리해야 함
 */
export function assignSeat(_seats, _seatId, _studentId) {
    // ❌ studentId 기반 할당 제거 - seat_assignments에서 관리해야 함
    console.warn('assignSeat 함수는 더 이상 사용하지 않습니다. seat_assignments에서 관리하세요.');
    return [];
}
/**
 * 좌석 할당 해제 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 관리해야 함
 */
export function unassignSeat(_seats, _seatId) {
    // ❌ studentId 기반 해제 제거 - seat_assignments에서 관리해야 함
    console.warn('unassignSeat 함수는 더 이상 사용하지 않습니다. seat_assignments에서 관리하세요.');
    return [];
}
/**
 * 좌석 상태 시각화 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export function visualizeSeatGrid(_seats, rows = SEAT_CONFIG.ROWS, cols = SEAT_CONFIG.COLS) {
    // ❌ studentId 기반 시각화 제거 - seat_assignments에서 조회해야 함
    console.warn('visualizeSeatGrid 함수는 더 이상 사용하지 않습니다. seat_assignments에서 조회하세요.');
    let grid = '';
    for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
            grid += '_ ';
        }
        grid += '\n';
    }
    return grid;
}
/**
 * 할당된 좌석 수 계산 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export function getAssignedSeatCount(_seats) {
    // ❌ studentId 기반 계산 제거 - seat_assignments에서 조회해야 함
    console.warn('getAssignedSeatCount 함수는 더 이상 사용하지 않습니다. seat_assignments에서 조회하세요.');
    return 0;
}
/**
 * 좌석 할당 상태 확인 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export function isSeatAssigned(_seat) {
    // ❌ studentId 기반 확인 제거 - seat_assignments에서 조회해야 함
    console.warn('isSeatAssigned 함수는 더 이상 사용하지 않습니다. seat_assignments에서 조회하세요.');
    return false;
}
//# sourceMappingURL=seat.js.map