import React from 'react'
import './EmptyTimetableState.css'

export const EmptyTimetableState: React.FC = () => {
  return (
    <div className="empty-timetable-state">
      <div className="empty-icon">📅</div>
      <h4>등록된 일정이 없습니다</h4>
      <p>수업 편집 화면에서 일정을 추가해 보세요.</p>
      <div className="empty-actions">
        <button className="empty-action-button">
          일정 추가하기
        </button>
      </div>
    </div>
  )
}
