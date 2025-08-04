import { useCallback } from 'react'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  setSelectedStudent, 
  setSearchTerm, 
  setFilter 
} from '../slice/studentsSlice'
import type { Student, StudentFormData } from '../types/students.types'

export const useStudents = () => {
  const dispatch = useAppDispatch()
  const { 
    students, 
    selectedStudent, 
    searchTerm, 
    filters, 
    isLoading, 
    error 
  } = useAppSelector(state => state.students)

  const handleAddStudent = useCallback((studentData: StudentFormData) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      status: 'active',
      enrollmentDate: new Date().toISOString().split('T')[0]
    }
    dispatch(addStudent(newStudent))
  }, [dispatch])

  const handleUpdateStudent = useCallback((student: Student) => {
    dispatch(updateStudent(student))
  }, [dispatch])

  const handleDeleteStudent = useCallback((studentId: string) => {
    dispatch(deleteStudent(studentId))
  }, [dispatch])

  const handleSelectStudent = useCallback((student: Student | null) => {
    dispatch(setSelectedStudent(student))
  }, [dispatch])

  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value))
  }, [dispatch])

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }))
  }, [dispatch, filters])

  return {
    students,
    selectedStudent,
    searchTerm,
    filters,
    isLoading,
    error,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleSelectStudent,
    handleSearchChange,
    handleFilterChange
  }
} 