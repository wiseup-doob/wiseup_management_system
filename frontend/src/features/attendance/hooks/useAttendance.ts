import { useCallback } from 'react'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { 
  updateSeatStatus, 
  setSearchTerm, 
  setSelectedSeat, 
  resetAllSeats, 
  markAllPresent,
  setStudents,
  setSeatAssignments,
  setSeats,
  updateSeatAssignment,
  updateStudentAttendance
} from '../slice/attendanceSlice'
import type { AttendanceStatus } from '@shared/types/common.types'
import type { Student, SeatAssignment } from '@shared/types'
import type { SeatAssignmentResponse } from '../types/attendance.types'

export const useAttendance = () => {
  const dispatch = useAppDispatch()
  const { seats, students, seatAssignments, searchTerm, selectedSeat, isLoading, error } = useAppSelector(state => state.attendance)

  const updateSeat = useCallback((seatId: string, status: AttendanceStatus) => {
    dispatch(updateSeatStatus({ seatId, status }))
  }, [dispatch])

  const updateStudentAttendanceStatus = useCallback((studentId: string, status: AttendanceStatus) => {
    dispatch(updateStudentAttendance({ studentId, status }))
  }, [dispatch])

  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value))
  }, [dispatch])

  const handleSeatSelection = useCallback((seatId: string | null) => {
    dispatch(setSelectedSeat(seatId))
  }, [dispatch])

  const handleResetAll = useCallback(() => {
    dispatch(resetAllSeats())
  }, [dispatch])

  const handleMarkAllPresent = useCallback(() => {
    dispatch(markAllPresent())
  }, [dispatch])

  const updateStudents = useCallback((students: Student[]) => {
    dispatch(setStudents(students))
  }, [dispatch])

  const updateSeatAssignments = useCallback((assignments: SeatAssignmentResponse[]) => {
    dispatch(setSeatAssignments(assignments))
  }, [dispatch])

  const updateSeats = useCallback((seats: any[]) => {
    dispatch(setSeats(seats))
  }, [dispatch])

  const updateSingleSeatAssignment = useCallback((assignment: SeatAssignmentResponse) => {
    dispatch(updateSeatAssignment(assignment))
  }, [dispatch])

  return {
    seats,
    students,
    seatAssignments,
    searchTerm,
    selectedSeat,
    isLoading,
    error,
    updateSeat,
    updateStudentAttendanceStatus,
    updateStudents,
    updateSeatAssignments,
    updateSeats,
    updateSingleSeatAssignment,
    handleSearchChange,
    handleSeatSelection,
    handleResetAll,
    handleMarkAllPresent
  }
} 