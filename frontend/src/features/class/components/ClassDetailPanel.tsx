import React from 'react'
import { Label } from '../../../components/labels/Label'
import { TimetableWidget, TimetableSkeleton } from '../../../components/business/timetable'
import type { ClassSectionWithDetails } from '../types/class.types'

interface ClassDetailPanelProps {
  selectedClass: ClassSectionWithDetails | null
  isLoading: boolean
}

export function ClassDetailPanel({ selectedClass, isLoading }: ClassDetailPanelProps) {
  // 스켈레톤 로딩 UI
  const renderDetailSkeleton = () => (
    <div className="detail-skeleton">
      <div className="skeleton-section">
        <div className="skeleton-title"></div>
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-info-item">
              <div className="skeleton-label"></div>
              <div className="skeleton-value"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="skeleton-section">
        <div className="skeleton-title"></div>
        <div className="skeleton-timetable"></div>
      </div>
    </div>
  )

  return (
    <div className="class-detail-panel">
      <div className="detail-header">
        <Label variant="heading" size="medium" className="section-title">
          {selectedClass ? `${selectedClass.name} 상세 정보` : '수업 상세 정보'}
        </Label>
        <Label variant="secondary" size="small" className="detail-subtitle">
          {selectedClass ? `${selectedClass.teacherId} 담당 | ${selectedClass.classroomId}` : '좌측에서 수업을 선택하세요'}
        </Label>
      </div>
      
      <div className="detail-content">
        {isLoading ? (
          renderDetailSkeleton()
        ) : selectedClass ? (
          <div className="class-detail-info">
            {/* 기본 정보 */}
            <div className="class-info-section">
              <h3>기본 정보</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">담당 교사:</span>
                  <span className="info-value">
                    {selectedClass.teacher?.name || selectedClass.teacherId}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">강의실:</span>
                  <span className="info-value">
                    {selectedClass.classroom?.name || selectedClass.classroomId}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">과목:</span>
                  <span className="info-value">
                    {selectedClass.course?.name || '미정'} ({selectedClass.course?.subject || '미정'})
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">학생 수:</span>
                  <span className="info-value">{selectedClass.currentStudents}/{selectedClass.maxStudents}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">상태:</span>
                  <span className={`info-value status-${selectedClass.status}`}>
                    {selectedClass.status === 'active' ? '활성' : 
                     selectedClass.status === 'inactive' ? '비활성' : '완료'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 시간표 */}
            <div className="timetable-section">
              <h3>수업 일정</h3>
              <div className="timetable-container">
                {!selectedClass ? (
                  <div className="empty-timetable-message">
                    <Label variant="secondary" size="medium">
                      좌측에서 수업을 선택하면 시간표가 표시됩니다.
                    </Label>
                  </div>
                ) : isLoading ? (
                  <TimetableSkeleton /> 
                ) : (
                  <TimetableWidget 
                    data={selectedClass} // 단일 객체 직접 전달
                    startHour={9}
                    endHour={23}
                    showConflicts={true}
                    showEmptySlots={true}
                    showTimeLabels={true}
                    onClassClick={(classData) => {
                      console.log('시간표에서 수업 클릭:', classData)
                    }}
                    className="class-timetable-widget"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-detail">
            <Label variant="secondary" size="medium">
              수업을 선택하면 상세 정보가 표시됩니다.
            </Label>
          </div>
        )}
      </div>
    </div>
  )
}