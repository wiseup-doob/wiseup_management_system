import React, { useMemo, useState, useCallback } from 'react'
import './TeacherDetailPanel.css'
import type { ClassSectionWithDetails } from '../types/class.types'
import { TimetableWidget, TimetableSkeleton } from '../../../components/business/timetable'
import { ClassDetailModal } from '../../../components/business/ClassDetailModal'

interface TeacherDetailPanelProps {
  teacherName: string
  teacherId: string
  classes: ClassSectionWithDetails[]
  onClose: () => void
  onRefreshClasses?: () => void  // 수업 목록 새로고침 콜백
}

export function TeacherDetailPanel({ teacherName, teacherId, classes, onClose, onRefreshClasses }: TeacherDetailPanelProps) {
  // 모달 관련 상태
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  // 색상 저장 후 수업 목록 새로고침 콜백
  const handleTeacherClassColorSaved = useCallback(() => {
    console.log('🎨 수업 색상 저장됨, 선생님 수업 목록 새로고침')
    // 선생님 수업 목록 새로고침 (props로 받은 onRefreshClasses 호출)
    onRefreshClasses?.()
  }, [onRefreshClasses])

  // 수업 클릭 핸들러
  const handleTimetableClassClick = useCallback((classData: any) => {
    console.log('📚 시간표 수업 클릭됨:', classData)
    setSelectedClassId(classData.id)
    setIsClassDetailModalOpen(true)
  }, [])

  // 모달 닫기 핸들러
  const handleCloseClassDetailModal = useCallback(() => {
    setIsClassDetailModalOpen(false)
    setSelectedClassId(null)
  }, [])

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
                onClassClick={handleTimetableClassClick}
                showTimeLabels={true}
                className="teacher-timetable-widget"
              />
            </div>
          ) : (
            <div className="no-schedule">
              <p>등록된 시간표가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 수업 상세 정보 모달 */}
      <ClassDetailModal
        isOpen={isClassDetailModalOpen}
        onClose={handleCloseClassDetailModal}
        classSectionId={selectedClassId}
        onColorSaved={handleTeacherClassColorSaved}
        showColorPicker={true}
        showStudentList={true}
      />
    </div>
  )
}