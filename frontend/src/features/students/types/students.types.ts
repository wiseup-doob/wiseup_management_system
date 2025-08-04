export interface Student {
  id: string
  name: string
  grade: string
  class: string
  studentNumber: string
  email?: string
  phone?: string
  address?: string
  status: 'active' | 'inactive' | 'graduated'
  enrollmentDate: string
  graduationDate?: string
}

export interface StudentsState {
  students: Student[]
  selectedStudent: Student | null
  searchTerm: string
  isLoading: boolean
  error: string | null
  filters: {
    grade: string
    class: string
    status: string
  }
}

export interface StudentFormData {
  name: string
  grade: string
  class: string
  studentNumber: string
  email?: string
  phone?: string
  address?: string
}

export type StudentStatus = 'active' | 'inactive' | 'graduated' 