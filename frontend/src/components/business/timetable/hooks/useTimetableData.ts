import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../../services/api'

export const useTimetableData = () => {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 시간표 데이터 가져오기
  const fetchTimetableData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 백엔드 API에서 수업 섹션 데이터 가져오기
      const response = await apiService.getClassSections()
      
      if (response.success && response.data) {
        // 응답 데이터 처리
        const classSections = Array.isArray(response.data) ? response.data : []
        
        // 시간표에 필요한 데이터만 필터링
        const timetableData = classSections.filter((section: any) => {
          return section.schedule && 
                 section.schedule.dayOfWeek && 
                 section.schedule.startTime && 
                 section.schedule.endTime
        })
        
        setData(timetableData)
      } else {
        setError('데이터를 가져오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('시간표 데이터 가져오기 오류:', err)
      setError('서버 연결 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 특정 수업 섹션 가져오기
  const fetchClassSection = useCallback(async (id: string) => {
    try {
      const response = await apiService.getClassSectionById(id)
      return response
    } catch (err) {
      console.error('수업 섹션 가져오기 오류:', err)
      throw err
    }
  }, [])

  // 수업 검색
  const searchClassSections = useCallback(async (searchParams: any) => {
    try {
      const response = await apiService.searchClassSections(searchParams)
      return response
    } catch (err) {
      console.error('수업 검색 오류:', err)
      throw err
    }
  }, [])

  // 수업 통계 가져오기
  const fetchClassStatistics = useCallback(async () => {
    try {
      const response = await apiService.getClassSectionStats()
      return response
    } catch (err) {
      console.error('수업 통계 가져오기 오류:', err)
      throw err
    }
  }, [])

  // 데이터 새로고침
  const refreshData = useCallback(() => {
    fetchTimetableData()
  }, [fetchTimetableData])

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchTimetableData()
  }, [fetchTimetableData])

  return {
    data,
    isLoading,
    error,
    fetchTimetableData,
    fetchClassSection,
    searchClassSections,
    fetchClassStatistics,
    refreshData
  }
}
