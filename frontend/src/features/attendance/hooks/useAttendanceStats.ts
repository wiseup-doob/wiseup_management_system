import { useMemo } from 'react'
import { useAppSelector } from '../../../hooks/useAppSelector'
import type { AttendanceStats } from '../types/attendance.types'
import { calculateAttendanceStats, calculateAttendanceRate } from '../../../utils/attendance.utils'

export const useAttendanceStats = () => {
  const { seats } = useAppSelector(state => state.attendance)
  
  const stats: AttendanceStats = useMemo(() => {
    return calculateAttendanceStats(seats)
  }, [seats])

  const attendanceRate = useMemo(() => {
    return calculateAttendanceRate(seats)
  }, [seats])

  return { stats, attendanceRate }
} 