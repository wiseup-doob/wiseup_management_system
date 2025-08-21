import { useState, useCallback, useEffect } from 'react'
import type { Student } from '@shared/types'
import { apiService } from '../../../services/api'

interface UseStudentsReturn {
  students: Student[]
  isLoading: boolean
  error: string | null
  loadStudents: () => Promise<void>
  clearError: () => void
}

export const useStudents = (): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStudents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getStudents()
      if (response.success && response.data) {
        setStudents(response.data)
      } else {
        setError(response.message || '학생 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError('학생 목록을 불러오는 중 오류가 발생했습니다.')
      console.error('학생 목록 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 초기 로딩
  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  return {
    students,
    isLoading,
    error,
    loadStudents,
    clearError
  }
}
