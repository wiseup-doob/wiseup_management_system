import type { Seat, AttendanceStatus } from '../features/attendance/types/attendance.types'
import type { ButtonVariant } from '../shared/types/button.types'

/**
 * 출결 상태에 따른 버튼 variant 반환
 */
export const getAttendanceVariant = (status: AttendanceStatus): ButtonVariant => {
  const variantMap: Record<AttendanceStatus, ButtonVariant> = {
    present: 'primary',
    absent: 'danger',
    late: 'secondary',
    unknown: 'ghost'
  }
  return variantMap[status]
}

/**
 * 출석률 계산
 */
export const calculateAttendanceRate = (seats: Seat[]): string => {
  const present = seats.filter(seat => seat.status === 'present').length
  const total = seats.length
  return total > 0 ? ((present / total) * 100).toFixed(1) : '0.0'
}

/**
 * 특정 상태의 자리 필터링
 */
export const filterSeatsByStatus = (seats: Seat[], status: AttendanceStatus): Seat[] => {
  return seats.filter(seat => seat.status === status)
}

/**
 * 검색어로 자리 필터링
 */
export const filterSeatsBySearchTerm = (seats: Seat[], searchTerm: string): Seat[] => {
  if (!searchTerm.trim()) return seats
  
  const lowerSearchTerm = searchTerm.toLowerCase()
  return seats.filter(seat => 
    seat.studentName.toLowerCase().includes(lowerSearchTerm)
  )
}

/**
 * 출결 상태 통계 계산
 */
export const calculateAttendanceStats = (seats: Seat[]) => {
  return {
    total: seats.length,
    present: seats.filter(seat => seat.status === 'present').length,
    absent: seats.filter(seat => seat.status === 'absent').length,
    late: seats.filter(seat => seat.status === 'late').length,
    unknown: seats.filter(seat => seat.status === 'unknown').length
  }
}

/**
 * 다음 출결 상태 반환 (토글용)
 */
export const getNextAttendanceStatus = (currentStatus: AttendanceStatus): AttendanceStatus => {
  const statusCycle: AttendanceStatus[] = ['unknown', 'present', 'absent', 'late']
  const currentIndex = statusCycle.indexOf(currentStatus)
  const nextIndex = (currentIndex + 1) % statusCycle.length
  return statusCycle[nextIndex]
}

/**
 * 자리 ID로 자리 찾기
 */
export const findSeatById = (seats: Seat[], seatId: string): Seat | undefined => {
  return seats.find(seat => seat.id === seatId)
}

/**
 * 자리 위치로 자리 찾기
 */
export const findSeatByPosition = (seats: Seat[], row: number, col: number): Seat | undefined => {
  return seats.find(seat => seat.row === row && seat.col === col)
} 