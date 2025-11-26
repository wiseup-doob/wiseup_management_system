import { useState, useCallback, useMemo } from 'react'
import type { Student, StudentSearchParams } from '@shared/types'
import { apiService } from '../../../services/api'

interface UseStudentSearchReturn {
  searchValue: string
  filters: {
    grade: string
  }
  searchResults: Student[]
  isSearching: boolean
  searchError: string | null
  setSearchValue: (value: string) => void
  setFilters: (filters: { grade: string }) => void
  handleSearch: (value: string) => Promise<void>
  handleFilter: (key: string, value: string) => Promise<void>
  clearSearchError: () => void
}

export const useStudentSearch = (students: Student[]): UseStudentSearchReturn => {
  const [searchValue, setSearchValue] = useState('')
  const [filters, setFilters] = useState({ grade: '' })
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // 검색 핸들러
  const handleSearch = useCallback(async (value: string) => {
    setSearchValue(value)
    
    if (!value.trim()) {
      // 검색어가 없으면 전체 학생 목록 표시
      setSearchResults(students)
      setSearchError(null)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const searchParams: StudentSearchParams = {
        name: value.trim(),
        status: 'active'
      }

      const response = await apiService.searchStudents(searchParams)
      if (response.success && response.data) {
        setSearchResults(response.data)
      } else {
        setSearchError(response.message || '검색에 실패했습니다.')
        setSearchResults([])
      }
    } catch (err) {
      setSearchError('검색 중 오류가 발생했습니다.')
      console.error('학생 검색 오류:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [students])

  // 필터 변경 핸들러
  const handleFilter = useCallback(async (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // 필터 적용
    setIsSearching(true)
    setSearchError(null)

    try {
      const searchParams: StudentSearchParams = {
        ...(searchValue.trim() && { name: searchValue.trim() }),
        ...(value && { [key]: value as any }),
        status: 'active'
      }

      const response = await apiService.searchStudents(searchParams)
      if (response.success && response.data) {
        setSearchResults(response.data)
      } else {
        setSearchError(response.message || '필터링에 실패했습니다.')
        setSearchResults([])
      }
    } catch (err) {
      setSearchError('필터링 중 오류가 발생했습니다.')
      console.error('필터 적용 오류:', err)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchValue, filters])

  // 에러 클리어
  const clearSearchError = useCallback(() => {
    setSearchError(null)
  }, [])

  // 초기 검색 결과 설정
  useMemo(() => {
    if (students.length > 0 && !searchValue.trim() && !filters.grade) {
      setSearchResults(students)
    }
  }, [students, searchValue, filters.grade])

  return {
    searchValue,
    filters,
    searchResults,
    isSearching,
    searchError,
    setSearchValue,
    setFilters,
    handleSearch,
    handleFilter,
    clearSearchError
  }
}
