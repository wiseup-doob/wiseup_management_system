import React from 'react'
import './TimetableSkeleton.css'

export const TimetableSkeleton: React.FC = () => {
  return (
    <div className="timetable-skeleton">
      {/* 요일 헤더 스켈레톤 */}
      <div className="skeleton-header">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton-day-header" />
        ))}
      </div>
      
      {/* 시간대별 행 스켈레톤 */}
      <div className="skeleton-time-column">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="skeleton-time-slot" />
        ))}
      </div>
      
      {/* 그리드 셀 스켈레톤 */}
      <div className="skeleton-grid">
        {Array.from({ length: 7 * 28 }).map((_, i) => (
          <div key={i} className="skeleton-cell" />
        ))}
      </div>
    </div>
  )
}
