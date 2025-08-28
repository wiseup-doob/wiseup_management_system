import { useState, useCallback } from 'react'
import type { Student } from '@shared/types'
import type { TimetableData, StudentTimetableResponse } from '../types/timetable.types'
import type { TimetableGrid } from '../../../components/business/timetable/types/timetable.types'
import { apiService } from '../../../services/api'
import { transformStudentTimetableResponse } from '../utils'

// ✅ 30분 단위 고정 시간표 설정
const TIMETABLE_CONFIG = {
  startHour: 9,
  endHour: 23,
  timeInterval: 30
}

// 빈 시간표 데이터 생성 (Hook 밖으로 이동)
const createEmptyTimetableData = (): TimetableData => {
  return {
    classSections: [],
    conflicts: [],
    metadata: {
      totalClasses: 0,
      totalStudents: 0,
      totalTeachers: 0
    }
  }
}

interface UseStudentTimetableReturn {
  timetableData: TimetableData
  isLoading: boolean
  error: string | null
  loadTimetable: (student: Student) => Promise<void>
  clearError: () => void
}

export const useStudentTimetable = (): UseStudentTimetableReturn => {
  // 시간표 데이터 상태 (초기값을 직접 정의)
  const [timetableData, setTimetableData] = useState<TimetableData>(createEmptyTimetableData())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 시간표 로드 (실제 API 호출 + 데이터 변환)
  const loadTimetable = useCallback(async (student: Student) => {
    if (!student) {
      setTimetableData(createEmptyTimetableData())
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`📚 ${student.name}의 시간표 로드 시작...`)
      
      const response = await apiService.getStudentTimetable(student.id)
      
      if (response.success && response.data) {
        console.log('✅ 시간표 데이터 로드 성공:', response.data)
        
        const timetableData: TimetableData = {
          classSections: response.data.classSections || [],
          conflicts: [],
          metadata: {
            totalClasses: response.data.classSections?.length || 0,
            totalStudents: 1,
            totalTeachers: 0
          }
        }
        
        setTimetableData(timetableData)
        console.log(`📚 ${student.name}의 시간표 로드 완료`, {
          classCount: response.data.classSections?.length || 0
        })
        
      } else {
        // 시간표가 없는 경우 (404 에러) - 빈 시간표로 처리
        console.log('🔍 응답 분석:', {
          success: response.success,
          message: response.message,
          hasData: !!response.data,
          dataType: typeof response.data
        })
        
        if (response.message?.includes('not found') || 
            response.message?.includes('Student timetable not found') ||
            response.message?.includes('Resource not found')) {
          console.log(`📚 ${student.name}의 시간표가 없습니다. 빈 시간표를 표시합니다.`)
          
          // 빈 시간표 데이터 생성
          const emptyTimetableData = createEmptyTimetableData()
          setTimetableData(emptyTimetableData)
          setError(null) // 에러 상태 해제
        } else {
          // 다른 에러의 경우
          const errorMessage = response.message || '시간표를 불러오는데 실패했습니다.'
          setError(errorMessage)
          console.error('❌ 시간표 로드 실패:', errorMessage)
          setTimetableData(createEmptyTimetableData())
        }
      }
      
    } catch (err) {
      const errorMessage = '시간표를 불러오는 중 오류가 발생했습니다.'
      setError(errorMessage)
      console.error('❌ 시간표 로드 오류:', err)
      setTimetableData(createEmptyTimetableData())
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 에러 클리어
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    timetableData,
    isLoading,
    error,
    loadTimetable,
    clearError
  }
}
