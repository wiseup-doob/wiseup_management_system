import { useCallback } from 'react'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { 
  addGrade, 
  updateGrade, 
  deleteGrade, 
  setSelectedGrade, 
  setSearchTerm, 
  setFilter 
} from '../slice/gradesSlice'
import type { Grade, GradeFormData } from '../types/grades.types'

export const useGrades = () => {
  const dispatch = useAppDispatch()
  const { 
    grades, 
    selectedGrade, 
    searchTerm, 
    filters, 
    isLoading, 
    error 
  } = useAppSelector(state => state.grades)

  const handleAddGrade = useCallback((gradeData: GradeFormData) => {
    dispatch(addGrade(gradeData))
  }, [dispatch])

  const handleUpdateGrade = useCallback((grade: Grade) => {
    dispatch(updateGrade(grade))
  }, [dispatch])

  const handleDeleteGrade = useCallback((gradeId: string) => {
    dispatch(deleteGrade(gradeId))
  }, [dispatch])

  const handleSelectGrade = useCallback((grade: Grade | null) => {
    dispatch(setSelectedGrade(grade))
  }, [dispatch])

  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value))
  }, [dispatch])

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }))
  }, [dispatch, filters])

  return {
    grades,
    selectedGrade,
    searchTerm,
    filters,
    isLoading,
    error,
    handleAddGrade,
    handleUpdateGrade,
    handleDeleteGrade,
    handleSelectGrade,
    handleSearchChange,
    handleFilterChange
  }
} 