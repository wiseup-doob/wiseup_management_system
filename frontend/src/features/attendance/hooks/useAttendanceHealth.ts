import { useState } from 'react'
import { apiService } from '../../../services/api'

interface SeatHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'
  totalSeats: number
  assignedSeats: number
  mismatchedSeats: number
  issues: Array<{
    seatId: string
    type: 'MISMATCH' | 'ORPHANED' | 'DUPLICATE'
    description: string
  }>
  lastChecked: string
}

interface UseAttendanceHealthReturn {
  seatHealth: SeatHealth | null
  isCheckingHealth: boolean
  isRepairing: boolean
  checkHealth: () => Promise<void>
  autoRepair: () => Promise<void>
}

export const useAttendanceHealth = (fetchData: () => Promise<void>): UseAttendanceHealthReturn => {
  const [seatHealth, setSeatHealth] = useState<SeatHealth | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [isRepairing, setIsRepairing] = useState(false)

  const checkHealth = async () => {
    try {
      setIsCheckingHealth(true)
      const response = await apiService.checkSeatHealth()
      if (response.success && response.data) {
        setSeatHealth(response.data)
        console.log('좌석 데이터 헬스체크 결과:', response.data)
      } else {
        console.error('헬스체크 실패:', response.error)
      }
    } catch (error) {
      console.error('헬스체크 오류:', error)
    } finally {
      setIsCheckingHealth(false)
    }
  }

  const autoRepair = async () => {
    try {
      setIsRepairing(true)
      const response = await apiService.autoRepairSeats()
      if (response.success && response.data) {
        console.log('자동 복구 완료:', response.data)
        // 복구 후 데이터 새로고침
        await fetchData()
        // 헬스체크도 다시 실행
        await checkHealth()
      } else {
        console.error('자동 복구 실패:', response.error)
      }
    } catch (error) {
      console.error('자동 복구 오류:', error)
    } finally {
      setIsRepairing(false)
    }
  }

  return {
    seatHealth,
    isCheckingHealth,
    isRepairing,
    checkHealth,
    autoRepair
  }
}
