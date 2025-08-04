export interface Seat {
  id: string
  studentName: string
  status: 'present' | 'absent' | 'late' | 'unknown'
  row: number
  col: number
}

import type { Student } from '../../../services/api'

export interface AttendanceState {
  seats: Seat[]
  students: Student[]
  searchTerm: string
  selectedSeat: string | null
  isLoading: boolean
  error: string | null
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'unknown'

export interface AttendanceStats {
  total: number
  present: number
  absent: number
  late: number
  unknown: number
}

export interface AttendanceAction {
  seatId: string
  status: AttendanceStatus
} 