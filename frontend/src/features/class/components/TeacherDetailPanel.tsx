import React, { useMemo } from 'react'
import './TeacherDetailPanel.css'
import type { ClassSectionWithDetails } from '../types/class.types'
import { TimetableWidget, TimetableSkeleton } from '../../../components/business/timetable'

interface TeacherDetailPanelProps {
  teacherName: string
  teacherId: string
  classes: ClassSectionWithDetails[]
  onClose: () => void
}

export function TeacherDetailPanel({ teacherName, teacherId, classes, onClose }: TeacherDetailPanelProps) {

  // 통계 계산
  const statistics = useMemo(() => {
    const totalClasses = classes.length
    const totalScheduleBlocks = classes.reduce((total, cls) => {
      return total + (cls.schedule?.length || 0)
    }, 0)
    const subjects = [...new Set(classes.map(cls => cls.course?.subject).filter(Boolean))]
    
    return {
      totalClasses,
      totalScheduleBlocks,
      subjects: subjects as string[]
    }
  }, [classes])

  return (
    <div className="teacher-detail-panel">
      <div className="teacher-panel-header">
        <h2 className="teacher-panel-name">{teacherName} 선생님</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="teacher-panel-content">
        {/* 통계 카드들 */}
        <div className="teacher-stats">
          <div className="stat-card">
            <div className="stat-number">{statistics.totalClasses}</div>
            <div className="stat-label">담당 수업</div>
          </div>
          {/* <div className="stat-card">
            <div className="stat-number">{statistics.totalScheduleBlocks}</div>
            <div className="stat-label">수업 시수</div>
          </div> */}
          {/* <div className="stat-card">
            <div className="stat-number">{statistics.subjects.length}</div>
            <div className="stat-label">담당 과목</div>
          </div> */}
          {/* 담당 과목 */}
        {statistics.subjects.length > 0 && (
          <div className="teacher-subjects">
            <h3>담당 과목</h3>
            <div className="subject-tags">
              {statistics.subjects.map(subject => (
                <span key={subject} className="subject-tag">{subject}</span>
              ))}
            </div>
          </div>
        )}
        </div>

        

        {/* 주간 시간표 */}
        <div className="teacher-schedule">
          <h3>주간 시간표</h3>
          {classes.length > 0 ? (
            <div className="teacher-timetable-container">
              <TimetableWidget 
                data={classes}
                startHour={9}
                endHour={23}
                showConflicts={true}
                showEmptySlots={false}
                showTimeLabels={true}
                onClassClick={(classData) => {
                  console.log('선생님 시간표에서 수업 클릭:', classData)
                }}
                className="teacher-timetable-widget"
              />
            </div>
          ) : (
            <div className="no-schedule">
              <p>등록된 시간표가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 수업 목록 */}
        {/* <div className="teacher-classes">
          <h3>담당 수업 목록</h3>
          {classes.length > 0 ? (
            <div className="teacher-classes-list">
              {classes.map(cls => (
                <div key={cls.id} className="teacher-class-item">
                  <div className="teacher-class-item-header">
                    <span className="teacher-class-item-name">{cls.name}</span>
                    <span className="teacher-class-item-status">{cls.status === 'active' ? '진행중' : '비활성'}</span>
                  </div>
                  <div className="teacher-class-item-details">
                    <span>과목: {cls.course?.subject || '미지정'}</span>
                    <span>교실: {cls.classroom?.name || '미지정'}</span>
                    <span>정원: {cls.currentStudents || 0}/{cls.maxStudents}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-classes">
              <p>담당 수업이 없습니다.</p>
            </div>
          )}
        </div> */}
      </div>
    </div>
  )
}