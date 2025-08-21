import { useState } from 'react'
import { apiService } from '../../../services/api'
import type { AttendanceStatus } from '@shared/types'

interface UseAttendanceActionsReturn {
  isAssigning: boolean
  isUnassigning: boolean
  isSwapping: boolean
  isUpdatingStatus: boolean
  assignStudentToSeat: (seatId: string, studentId: string) => Promise<boolean>
  unassignStudentFromSeat: (seatId: string) => Promise<boolean>
  swapSeats: (seatId1: string, seatId2: string) => Promise<boolean>
  updateSeatStatus: (seatId: string, status: AttendanceStatus) => Promise<boolean>
  checkSeatHealth: () => Promise<any>
  autoRepairSeats: () => Promise<boolean>
}

export const useAttendanceActions = (): UseAttendanceActionsReturn => {
  const [isAssigning, setIsAssigning] = useState(false)
  const [isUnassigning, setIsUnassigning] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const assignStudentToSeat = async (seatId: string, studentId: string): Promise<boolean> => {
    try {
      setIsAssigning(true)
      console.log(`학생 ${studentId}를 좌석 ${seatId}에 배정 중...`)
      
      const response = await apiService.assignStudentToSeat(seatId, studentId, 'admin')
      
      if (response.success) {
        console.log(`✅ 학생 ${studentId}를 좌석 ${seatId}에 배정 완료`)
        return true
      } else {
        console.error(`❌ 좌석 배정 실패:`, response.message)
        return false
      }
    } catch (error) {
      console.error('좌석 배정 중 오류 발생:', error)
      return false
    } finally {
      setIsAssigning(false)
    }
  }

  const unassignStudentFromSeat = async (seatId: string): Promise<boolean> => {
    try {
      setIsUnassigning(true)
      console.log(`좌석 ${seatId}에서 학생 배정 해제 중...`)
      
      const response = await apiService.unassignStudentFromSeat(seatId, 'admin')
      
      if (response.success) {
        console.log(`✅ 좌석 ${seatId}에서 학생 배정 해제 완료`)
        return true
      } else {
        console.error(`❌ 좌석 배정 해제 실패:`, response.message)
        return false
      }
    } catch (error) {
      console.error('좌석 배정 해제 중 오류 발생:', error)
      return false
    } finally {
      setIsUnassigning(false)
    }
  }

  const swapSeats = async (seatId1: string, seatId2: string): Promise<boolean> => {
    try {
      setIsSwapping(true)
      console.log(`좌석 ${seatId1}와 ${seatId2} 교환 중...`)
      
      const response = await apiService.swapSeatPositions(seatId1, seatId2, 'admin')
      
      if (response.success) {
        console.log(`✅ 좌석 ${seatId1}와 ${seatId2} 교환 완료`)
        return true
      } else {
        console.error(`❌ 좌석 교환 실패:`, response.message)
        return false
      }
    } catch (error) {
      console.error('좌석 교환 중 오류 발생:', error)
      return false
    } finally {
      setIsSwapping(false)
    }
  }

  const updateSeatStatus = async (seatId: string, status: AttendanceStatus): Promise<boolean> => {
    try {
      setIsUpdatingStatus(true)
      console.log(`좌석 ${seatId} 상태를 ${status}로 업데이트 중...`)
      
      const response = await apiService.updateSeatStatus(seatId, status, 'admin')
      
      if (response.success) {
        console.log(`✅ 좌석 ${seatId} 상태 업데이트 완료: ${status}`)
        return true
      } else {
        console.error(`❌ 좌석 상태 업데이트 실패:`, response.message)
        return false
      }
    } catch (error) {
      console.error('좌석 상태 업데이트 중 오류 발생:', error)
      return false
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const checkSeatHealth = async (): Promise<any> => {
    try {
      console.log('좌석 데이터 헬스체크 시작...')
      
      const response = await apiService.checkSeatHealth()
      
      if (response.success) {
        console.log('✅ 좌석 데이터 헬스체크 완료:', response.data)
        return response.data
      } else {
        console.error('❌ 좌석 데이터 헬스체크 실패:', response.message)
        return null
      }
    } catch (error) {
      console.error('좌석 데이터 헬스체크 중 오류 발생:', error)
      return null
    }
  }

  const autoRepairSeats = async (): Promise<boolean> => {
    try {
      console.log('좌석 데이터 자동 복구 시작...')
      
      const response = await apiService.autoRepairSeats()
      
      if (response.success) {
        console.log('✅ 좌석 데이터 자동 복구 완료')
        return true
      } else {
        console.error('❌ 좌석 데이터 자동 복구 실패:', response.message)
        return false
      }
    } catch (error) {
      console.error('좌석 데이터 자동 복구 중 오류 발생:', error)
      return false
    }
  }

  return {
    isAssigning,
    isUnassigning,
    isSwapping,
    isUpdatingStatus,
    assignStudentToSeat,
    unassignStudentFromSeat,
    swapSeats,
    updateSeatStatus,
    checkSeatHealth,
    autoRepairSeats
  }
}
