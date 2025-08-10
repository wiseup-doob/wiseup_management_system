import { useState, useEffect } from 'react'
import { BaseWidget } from '../../base/BaseWidget'
import { Label } from '../../labels/Label'
import { apiService } from '../../../services/api'
import type { AttendanceRecord } from '@shared/types'
import './AttendanceStats.css'

interface AttendanceStatsData {
  totalRecords: number
  statusCounts: Record<string, number>
  averageAttendanceRate: number
  averageCheckInTime?: string
  averageCheckOutTime?: string
  lateCount: number
  earlyLeaveCount: number
}

function AttendanceStats() {
  const [stats, setStats] = useState<AttendanceStatsData>({
    totalRecords: 0,
    statusCounts: {},
    averageAttendanceRate: 0,
    lateCount: 0,
    earlyLeaveCount: 0
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 통계 데이터 로드
  useEffect(() => {
    loadAttendanceStats()
  }, [])

  const loadAttendanceStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getAttendanceStatistics()
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        console.warn('출석 통계 로드 실패:', response.error)
        setError('통계 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('출석 통계 로드 오류:', error)
      setError('통계 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 출석률 계산
  const attendanceRate = Math.round(stats.averageAttendanceRate * 100)

  if (loading) {
    return (
      <BaseWidget className="attendance-stats loading">
        <div className="loading-spinner">통계를 불러오는 중...</div>
      </BaseWidget>
    )
  }

  if (error) {
    return (
      <BaseWidget className="attendance-stats error">
        <div className="error-message">{error}</div>
        <button onClick={loadAttendanceStats} className="retry-button">
          다시 시도
        </button>
      </BaseWidget>
    )
  }

  return (
    <BaseWidget className="attendance-stats">
      <Label variant="heading" size="medium" className="stats-title">
        출결 통계
      </Label>
      
      <div className="stats-grid">
        <div className="stat-item total">
          <span className="stat-label">전체</span>
          <span className="stat-value">{stats.totalRecords}</span>
        </div>
        
        <div className="stat-item present">
          <span className="stat-label">출석</span>
          <span className="stat-value">{stats.statusCounts.present || 0}</span>
        </div>
        
        <div className="stat-item dismissed">
          <span className="stat-label">하원</span>
          <span className="stat-value">{stats.statusCounts.dismissed || 0}</span>
        </div>
        
        <div className="stat-item unauthorized-absent">
          <span className="stat-label">무단결석</span>
          <span className="stat-value">{stats.statusCounts.unauthorized_absent || 0}</span>
        </div>
        
        <div className="stat-item authorized-absent">
          <span className="stat-label">사유결석</span>
          <span className="stat-value">{stats.statusCounts.authorized_absent || 0}</span>
        </div>
        
        <div className="stat-item not-enrolled">
          <span className="stat-label">미등원</span>
          <span className="stat-value">{stats.statusCounts.not_enrolled || 0}</span>
        </div>
      </div>
      
      <div className="attendance-rate">
        <span className="rate-label">출석률</span>
        <span className="rate-value">{attendanceRate}%</span>
      </div>
      
      <div className="additional-stats">
        <div className="stat-row">
          <span className="stat-label">평균 등원 시간</span>
          <span className="stat-value">{stats.averageCheckInTime || '09:00'}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">평균 하원 시간</span>
          <span className="stat-value">{stats.averageCheckOutTime || '17:00'}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">지각 횟수</span>
          <span className="stat-value">{stats.lateCount}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">조퇴 횟수</span>
          <span className="stat-value">{stats.earlyLeaveCount}</span>
        </div>
      </div>
    </BaseWidget>
  )
}

export { AttendanceStats } 