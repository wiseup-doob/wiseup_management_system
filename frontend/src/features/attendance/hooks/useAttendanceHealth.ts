import { useState, useCallback } from 'react'
import type { SeatHealthStatus } from '../types/attendance.types'

interface UseAttendanceHealthReturn {
  seatHealth: SeatHealthStatus | null
  isCheckingHealth: boolean
  isRepairing: boolean
  checkHealth: () => Promise<void>
  autoRepair: () => Promise<void>
}

export const useAttendanceHealth = (
  fetchData: () => Promise<void>
): UseAttendanceHealthReturn => {
  const [seatHealth, setSeatHealth] = useState<SeatHealthStatus | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [isRepairing, setIsRepairing] = useState(false)

  const checkHealth = useCallback(async () => {
    try {
      setIsCheckingHealth(true)
      setSeatHealth(null)
      
      console.log('🔍 좌석 데이터 헬스체크 시작...')
      
      // API 호출하여 헬스체크 실행
      const response = await fetch('/api/seats/health')
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ 좌석 데이터 헬스체크 완료:', data.data)
        setSeatHealth(data.data)
      } else {
        console.error('❌ 좌석 데이터 헬스체크 실패:', data.message)
        setSeatHealth(null)
      }
    } catch (error) {
      console.error('좌석 데이터 헬스체크 중 오류 발생:', error)
      setSeatHealth(null)
    } finally {
      setIsCheckingHealth(false)
    }
  }, [])

  const autoRepair = useCallback(async () => {
    try {
      setIsRepairing(true)
      
      console.log('🔧 좌석 데이터 자동 복구 시작...')
      
      // API 호출하여 자동 복구 실행
      const response = await fetch('/api/seats/repair', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ 좌석 데이터 자동 복구 완료')
        
        // 복구 완료 후 헬스체크 다시 실행
        await checkHealth()
        
        // 데이터 새로고침
        await fetchData()
      } else {
        console.error('❌ 좌석 데이터 자동 복구 실패:', data.message)
      }
    } catch (error) {
      console.error('좌석 데이터 자동 복구 중 오류 발생:', error)
    } finally {
      setIsRepairing(false)
    }
  }, [checkHealth, fetchData])

  return {
    seatHealth,
    isCheckingHealth,
    isRepairing,
    checkHealth,
    autoRepair
  }
}
