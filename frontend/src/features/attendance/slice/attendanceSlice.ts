import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Student, AttendanceRecord, Seat } from '@shared/types'
import type { AttendanceStatus } from '@shared/types/common.types'
import type { AttendanceState, AttendanceAction, SeatAssignmentResponse } from '../types/attendance.types'

const initialState: AttendanceState = {
  seats: Array.from({ length: 48 }, (_, index) => ({
    id: `seat-${index + 1}`,
    seatId: `seat_${String(index + 1).padStart(3, '0')}`,
    seatNumber: index + 1,
    row: Math.floor(index / 6) + 1,
    col: (index % 6) + 1,
    studentId: undefined,
    studentName: undefined,
    status: 'dismissed' as const,
    assignedDate: undefined,
    lastUpdated: new Date().toISOString(),
    notes: undefined
  })),
  students: [],
  seatAssignments: [],
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
    
    // 학생 출결 상태 변경 (좌석 배정 데이터도 함께 업데이트)
    updateStudentAttendance: (state, action: PayloadAction<{ studentId: string; status: AttendanceStatus }>) => {
      const { studentId, status } = action.payload
      
      console.log('=== Redux updateStudentAttendance 액션 실행 ===')
      console.log('학생 ID:', studentId)
      console.log('변경할 상태:', status)
      console.log('현재 학생 수:', state.students.length)
      console.log('현재 좌석 수:', state.seats.length)
      console.log('현재 배정 수:', state.seatAssignments.length)
      
      // 학생 데이터 업데이트
      const student = state.students.find(s => s.id === studentId)
      if (student) {
        console.log('학생 찾음:', student.name);
        console.log('이전 학생 상태:', student.currentStatus?.currentAttendance);
        if (!student.currentStatus) {
          student.currentStatus = {};
        }
        student.currentStatus.currentAttendance = status;
        console.log('변경된 학생 상태:', student.currentStatus.currentAttendance);
      } else {
        console.log('❌ 학생을 찾을 수 없음:', studentId);
      }
      
      // 좌석 배정 데이터 업데이트
      const assignment = state.seatAssignments.find(a => a.studentId === studentId)
      if (assignment) {
        console.log('배정 찾음:', assignment.seatId);
        console.log('이전 배정 상태:', assignment.status);
        assignment.status = status;
        console.log('변경된 배정 상태:', assignment.status);
      } else {
        console.log('❌ 배정을 찾을 수 없음:', studentId);
      }
      
      // 좌석 상태 업데이트 (새로운 스키마에 맞게 수정)
      const seat = state.seats.find(s => s.currentAssignment?.studentId === studentId)
      if (seat) {
        console.log('좌석 찾음:', seat.id);
        console.log('이전 좌석 상태:', seat.status);
        seat.status = status;
        console.log('변경된 좌석 상태:', seat.status);
      } else {
        console.log('❌ 좌석을 찾을 수 없음:', studentId);
      }
      
      console.log('✅ Redux 상태 업데이트 완료')
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
        seat.status = 'dismissed'
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
    },
    
    // 좌석 배정 데이터 설정
    setSeatAssignments: (state, action: PayloadAction<SeatAssignmentResponse[]>) => {
      state.seatAssignments = action.payload
      
      // 좌석 배정 정보를 좌석 상태에 반영 (새로운 스키마에 맞게 수정)
      state.seats.forEach(seat => {
        const assignment = action.payload.find(a => a.seatId === seat.seatId)
        if (assignment) {
          seat.currentAssignment = {
            studentId: assignment.studentId,
            studentName: assignment.studentName,
            status: assignment.status,
            assignedDate: assignment.assignedDate
          }
          seat.status = assignment.status
        } else {
          // 배정되지 않은 좌석은 초기화
          seat.currentAssignment = null
          seat.status = 'dismissed'
        }
      })
    },
    
    // 좌석 데이터 설정
    setSeats: (state, action: PayloadAction<Seat[]>) => {
      state.seats = action.payload
    },
    
    // 좌석 배정 업데이트
    updateSeatAssignment: (state, action: PayloadAction<SeatAssignmentResponse>) => {
      const assignment = action.payload
      const seat = state.seats.find(s => s.seatId === assignment.seatId)
      if (seat) {
        seat.currentAssignment = {
          studentId: assignment.studentId,
          studentName: assignment.studentName,
          status: assignment.status,
          assignedDate: assignment.assignedDate
        }
        seat.status = assignment.status
      }
    }
  }
})

export const {
  updateSeatStatus,
  updateStudentAttendance,
  setSearchTerm,
  setSelectedSeat,
  resetAllSeats,
  markAllPresent,
  setLoading,
  setError,
  setStudents,
  setSeatAssignments,
  setSeats,
  updateSeatAssignment
} = attendanceSlice.actions

export default attendanceSlice.reducer 