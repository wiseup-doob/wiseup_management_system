import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Seat, AttendanceState, AttendanceStatus, AttendanceAction } from '../types/attendance.types'
import type { Student } from '../../../services/api'

const initialState: AttendanceState = {
  seats: Array.from({ length: 48 }, (_, index) => ({
    id: `seat-${index + 1}`,
    studentName: `학생${index + 1}`,
    status: 'unknown' as const,
    row: Math.floor(index / 6) + 1,
    col: (index % 6) + 1
  })),
  students: [],
  searchTerm: '',
  selectedSeat: null,
  isLoading: false,
  error: null
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // 출결 상태 변경
    updateSeatStatus: (state, action: PayloadAction<AttendanceAction>) => {
      const { seatId, status } = action.payload
      const seat = state.seats.find(s => s.id === seatId)
      if (seat) {
        seat.status = status
      }
    },
    
    // 검색어 변경
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    
    // 선택된 자리 변경
    setSelectedSeat: (state, action: PayloadAction<string | null>) => {
      state.selectedSeat = action.payload
    },
    
    // 모든 자리 초기화
    resetAllSeats: (state) => {
      state.seats.forEach(seat => {
        seat.status = 'unknown'
      })
    },
    
    // 출석 처리
    markAllPresent: (state) => {
      state.seats.forEach(seat => {
        seat.status = 'present'
      })
    },
    
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // 에러 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // 학생 데이터 설정
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload
    }
  }
})

export const {
  updateSeatStatus,
  setSearchTerm,
  setSelectedSeat,
  resetAllSeats,
  markAllPresent,
  setLoading,
  setError,
  setStudents
} = attendanceSlice.actions

export default attendanceSlice.reducer 