import type { Student, AttendanceRecord } from '@shared/types'
import type { AttendanceStatus } from '@shared/types/common.types'
import type { SeatWithStudent } from '../features/attendance/types/attendance.types'
import type { ButtonVariant } from '../types/components'

// 출석 상태별 버튼 스타일
export const ATTENDANCE_STATUS_BUTTON_VARIANTS: Record<AttendanceStatus, ButtonVariant> = {
  present: 'primary',
  dismissed: 'secondary',
  unauthorized_absent: 'danger',
  authorized_absent: 'warning',
  not_enrolled: 'secondary'
}

// 출석 상태별 배경색
export const ATTENDANCE_STATUS_BG_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-green-100',
  dismissed: 'bg-blue-100',
  unauthorized_absent: 'bg-red-100',
  authorized_absent: 'bg-yellow-100',
  not_enrolled: 'bg-gray-100'
}

// 출석 상태별 텍스트 색상
export const ATTENDANCE_STATUS_TEXT_COLORS: Record<AttendanceStatus, string> = {
  present: 'text-green-800',
  dismissed: 'text-blue-800',
  unauthorized_absent: 'text-red-800',
  authorized_absent: 'text-yellow-800',
  not_enrolled: 'text-gray-800'
}

/**
 * 출석률 계산
 */
export const calculateAttendanceRate = (seats: SeatWithStudent[]): string => {
  const present = seats.filter(seat => seat.status === 'present').length
  const total = seats.length
  return total > 0 ? ((present / total) * 100).toFixed(1) : '0.0'
}

/**
 * 특정 상태의 자리 필터링
 */
export const filterSeatsByStatus = (seats: SeatWithStudent[], status: AttendanceStatus): SeatWithStudent[] => {
  return seats.filter(seat => seat.status === status)
}

/**
 * 검색어로 자리 필터링
 */
export const filterSeatsBySearchTerm = (seats: SeatWithStudent[], searchTerm: string): SeatWithStudent[] => {
  if (!searchTerm.trim()) return seats
  
  const lowerSearchTerm = searchTerm.toLowerCase()
  return seats.filter(seat => 
    seat.currentAssignment?.studentName?.toLowerCase().includes(lowerSearchTerm) || false
  )
}

/**
 * 출결 상태 통계 계산
 */
export const calculateAttendanceStats = (seats: SeatWithStudent[]) => {
  return {
    total: seats.length,
    present: seats.filter(seat => seat.status === 'present').length,
    dismissed: seats.filter(seat => seat.status === 'dismissed').length,
    unauthorized_absent: seats.filter(seat => seat.status === 'unauthorized_absent').length,
    authorized_absent: seats.filter(seat => seat.status === 'authorized_absent').length
  }
}

/**
 * 다음 출결 상태 반환 (토글용)
 */
export const getNextAttendanceStatus = (currentStatus: AttendanceStatus): AttendanceStatus => {
  const statusCycle: AttendanceStatus[] = ['dismissed', 'present', 'unauthorized_absent', 'authorized_absent']
  const currentIndex = statusCycle.indexOf(currentStatus)
  const nextIndex = (currentIndex + 1) % statusCycle.length
  return statusCycle[nextIndex]
}

/**
 * 자리 ID로 자리 찾기
 */
export const findSeatById = (seats: SeatWithStudent[], seatId: string): SeatWithStudent | undefined => {
  return seats.find(seat => seat.id === seatId)
}

/**
 * 자리 위치로 자리 찾기
 */
export const findSeatByPosition = (seats: SeatWithStudent[], row: number, col: number): SeatWithStudent | undefined => {
  return seats.find(seat => seat.row === row && seat.col === col)
} 