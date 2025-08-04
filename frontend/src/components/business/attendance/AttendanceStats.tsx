import { useAttendanceStats } from '../../../features/attendance/hooks/useAttendanceStats'
import { BaseWidget } from '../../base/BaseWidget'
import { Label } from '../../labels/Label'
import './AttendanceStats.css'

function AttendanceStats() {
  const { stats, attendanceRate } = useAttendanceStats()
  
  return (
    <div className="attendance-stats">
      <h3>출결 통계</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">전체</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item present">
          <span className="stat-label">출석</span>
          <span className="stat-value">{stats.present}</span>
        </div>
        <div className="stat-item absent">
          <span className="stat-label">결석</span>
          <span className="stat-value">{stats.absent}</span>
        </div>
        <div className="stat-item late">
          <span className="stat-label">지각</span>
          <span className="stat-value">{stats.late}</span>
        </div>
        <div className="stat-item unknown">
          <span className="stat-label">미정</span>
          <span className="stat-value">{stats.unknown}</span>
        </div>
      </div>
      <div className="attendance-rate">
        <span className="rate-label">출석률</span>
        <span className="rate-value">{attendanceRate}%</span>
      </div>
    </div>
  )
}

export { AttendanceStats } 