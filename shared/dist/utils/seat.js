// 좌석 상태 확인
export function isSeatAvailable(seat) {
    return seat.status === 'vacant' && seat.isActive;
}
// 좌석 번호로 좌석 찾기
export function findSeatByNumber(seats, seatNumber) {
    return seats.find(seat => seat.seatNumber === seatNumber);
}
// 사용 가능한 좌석 필터링
export function getAvailableSeats(seats) {
    return seats.filter(seat => isSeatAvailable(seat));
}
// 좌석 상태 업데이트
export function updateSeatStatus(seat, newStatus) {
    return {
        ...seat,
        status: newStatus,
        updatedAt: new Date() // FirestoreTimestamp 타입으로 변환 필요
    };
}
//# sourceMappingURL=seat.js.map