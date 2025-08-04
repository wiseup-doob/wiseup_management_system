import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Student, StudentsState, StudentFormData } from '../types/students.types'

const initialState: StudentsState = {
  students: [
    {
      id: '1',
      name: '김철수',
      grade: '1학년',
      class: '1반',
      studentNumber: '2024001',
      email: 'kim@example.com',
      phone: '010-1234-5678',
      status: 'active',
      enrollmentDate: '2024-03-01'
    },
    {
      id: '2',
      name: '이영희',
      grade: '2학년',
      class: '3반',
      studentNumber: '2023002',
      email: 'lee@example.com',
      phone: '010-2345-6789',
      status: 'active',
      enrollmentDate: '2023-03-01'
    }
  ],
  selectedStudent: null,
  searchTerm: '',
  isLoading: false,
  error: null,
  filters: {
    grade: '',
    class: '',
    status: ''
  }
}

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // 학생 추가
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload)
    },
    
    // 학생 수정
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.students[index] = action.payload
      }
    },
    
    // 학생 삭제
    deleteStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter(s => s.id !== action.payload)
    },
    
    // 선택된 학생 설정
    setSelectedStudent: (state, action: PayloadAction<Student | null>) => {
      state.selectedStudent = action.payload
    },
    
    // 검색어 설정
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    
    // 필터 설정
    setFilter: (state, action: PayloadAction<{ key: keyof StudentsState['filters']; value: string }>) => {
      const { key, value } = action.payload
      state.filters[key] = value
    },
    
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // 에러 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const {
  addStudent,
  updateStudent,
  deleteStudent,
  setSelectedStudent,
  setSearchTerm,
  setFilter,
  setLoading,
  setError
} = studentsSlice.actions

export default studentsSlice.reducer 