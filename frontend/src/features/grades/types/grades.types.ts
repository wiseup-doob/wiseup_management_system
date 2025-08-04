export interface Grade {
  id: string
  studentId: string
  studentName: string
  subject: string
  score: number
  maxScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  semester: string
  year: string
  examType: 'midterm' | 'final' | 'quiz' | 'assignment'
  date: string
}

export interface GradesState {
  grades: Grade[]
  selectedGrade: Grade | null
  searchTerm: string
  isLoading: boolean
  error: string | null
  filters: {
    subject: string
    semester: string
    year: string
    examType: string
  }
}

export interface GradeFormData {
  studentId: string
  subject: string
  score: number
  maxScore: number
  semester: string
  year: string
  examType: 'midterm' | 'final' | 'quiz' | 'assignment'
  date: string
}

export type GradeLevel = 'A' | 'B' | 'C' | 'D' | 'F'
export type ExamType = 'midterm' | 'final' | 'quiz' | 'assignment' 