import { useCallback } from 'react'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { 
  updateSeatStatus, 
  setSearchTerm, 
  setSelectedSeat, 
  resetAllSeats, 
  markAllPresent,
  setStudents
} from '../slice/attendanceSlice'
import type { AttendanceStatus } from '../types/attendance.types'
import type { Student } from '../../../services/api'

export const useAttendance = () => {
  const dispatch = useAppDispatch()
  const { seats, students, searchTerm, selectedSeat, isLoading, error } = useAppSelector(state => state.attendance)

  const updateSeat = useCallback((seatId: string, status: AttendanceStatus) => {
    dispatch(updateSeatStatus({ seatId, status }))
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

  return {
    seats,
    students,
    searchTerm,
    selectedSeat,
    isLoading,
    error,
    updateSeat,
    updateStudents,
    handleSearchChange,
    handleSeatSelection,
    handleResetAll,
    handleMarkAllPresent
  }
} 