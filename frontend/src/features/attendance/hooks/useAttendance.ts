import { useState, useCallback } from 'react'
import type { Student, Seat } from '@shared/types'
import type { SeatAssignmentResponse } from '../types/attendance.types'

interface UseAttendanceReturn {
  seats: Seat[]
  students: Student[]
  seatAssignments: SeatAssignmentResponse[]
  searchTerm: string
  updateSeat: (seat: Seat) => void
  updateStudents: (students: Student[]) => void
  updateSeatAssignments: (assignments: SeatAssignmentResponse[]) => void
  updateStudentAttendanceStatus: (studentId: string, status: string) => void
  handleSearchChange: (value: string) => void
  updateSeats: (seats: Seat[]) => void
}

export const useAttendance = (): UseAttendanceReturn => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignmentResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const updateSeat = useCallback((seat: Seat) => {
    setSeats(prev => prev.map(s => s.id === seat.id ? seat : s))
  }, [])

  const updateStudents = useCallback((newStudents: Student[]) => {
    setStudents(newStudents)
  }, [])

  const updateSeatAssignments = useCallback((newAssignments: SeatAssignmentResponse[]) => {
    setSeatAssignments(newAssignments)
  }, [])

  const updateStudentAttendanceStatus = useCallback((studentId: string, status: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          currentStatus: {
            ...student.currentStatus,
            currentAttendance: status as any
          }
        }
      }
      return student
    }))
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const updateSeats = useCallback((newSeats: Seat[]) => {
    setSeats(newSeats)
  }, [])

  return {
    seats,
    students,
    seatAssignments,
    searchTerm,
    updateSeat,
    updateStudents,
    updateSeatAssignments,
    updateStudentAttendanceStatus,
    handleSearchChange,
    updateSeats
  }
} 