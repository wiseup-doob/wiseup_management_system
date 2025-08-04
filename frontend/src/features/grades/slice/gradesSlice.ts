import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Grade, GradesState, GradeFormData } from '../types/grades.types'

const getGradeFromScore = (score: number, maxScore: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
  const percentage = (score / maxScore) * 100
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

const initialState: GradesState = {
  grades: [
    {
      id: '1',
      studentId: '1',
      studentName: '김철수',
      subject: '수학',
      score: 85,
      maxScore: 100,
      grade: 'B',
      semester: '1학기',
      year: '2024',
      examType: 'midterm',
      date: '2024-04-15'
    },
    {
      id: '2',
      studentId: '2',
      studentName: '이영희',
      subject: '영어',
      score: 92,
      maxScore: 100,
      grade: 'A',
      semester: '1학기',
      year: '2024',
      examType: 'midterm',
      date: '2024-04-15'
    }
  ],
  selectedGrade: null,
  searchTerm: '',
  isLoading: false,
  error: null,
  filters: {
    subject: '',
    semester: '',
    year: '',
    examType: ''
  }
}

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    // 성적 추가
    addGrade: (state, action: PayloadAction<GradeFormData>) => {
      const newGrade: Grade = {
        ...action.payload,
        id: Date.now().toString(),
        grade: getGradeFromScore(action.payload.score, action.payload.maxScore),
        studentName: '학생명' // 실제로는 학생 ID로 조회
      }
      state.grades.push(newGrade)
    },
    
    // 성적 수정
    updateGrade: (state, action: PayloadAction<Grade>) => {
      const index = state.grades.findIndex(g => g.id === action.payload.id)
      if (index !== -1) {
        state.grades[index] = action.payload
      }
    },
    
    // 성적 삭제
    deleteGrade: (state, action: PayloadAction<string>) => {
      state.grades = state.grades.filter(g => g.id !== action.payload)
    },
    
    // 선택된 성적 설정
    setSelectedGrade: (state, action: PayloadAction<Grade | null>) => {
      state.selectedGrade = action.payload
    },
    
    // 검색어 설정
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    
    // 필터 설정
    setFilter: (state, action: PayloadAction<{ key: keyof GradesState['filters']; value: string }>) => {
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
  addGrade,
  updateGrade,
  deleteGrade,
  setSelectedGrade,
  setSearchTerm,
  setFilter,
  setLoading,
  setError
} = gradesSlice.actions

export default gradesSlice.reducer 