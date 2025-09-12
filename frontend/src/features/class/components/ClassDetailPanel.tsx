import React, { useState, useEffect, useCallback } from 'react'
import { Label } from '../../../components/labels/Label'
import { TimetableWidget, TimetableSkeleton } from '../../../components/business/timetable'
import { ClassDetailModal } from '../../../components/business/ClassDetailModal'
import { apiService } from '../../../services/api'
import type { ClassSectionWithDetails } from '../types/class.types'
import type { Student } from '@shared/types/student.types'

interface ClassDetailPanelProps {
  selectedClass: ClassSectionWithDetails | null
  isLoading: boolean
  onRefreshClasses?: () => void  // 수업 목록 새로고침 콜백
}

export function ClassDetailPanel({ selectedClass, isLoading, onRefreshClasses }: ClassDetailPanelProps) {
  // 수강 인원 관련 상태
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  
  // 모달 관련 상태
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  // 색상 저장 후 수업 목록 새로고침 콜백
  const handleClassColorSaved = useCallback(() => {
    console.log('🎨 수업 색상 저장됨, 수업 목록 새로고침')
    // 수업 목록 새로고침
    onRefreshClasses?.()
  }, [onRefreshClasses])

  // 수업 클릭 핸들러
  const handleClassClick = useCallback((classData: any) => {
    console.log('📚 수업 클릭됨:', classData)
    setSelectedClassId(classData.id)
    setIsClassDetailModalOpen(true)
  }, [])

  // 모달 닫기 핸들러
  const handleCloseClassDetailModal = useCallback(() => {
    setIsClassDetailModalOpen(false)
    setSelectedClassId(null)
  }, [])

  // 수강 인원 데이터 가져오기
  const fetchEnrolledStudents = useCallback(async (classSectionId: string) => {
    setIsLoadingStudents(true)
    setStudentsError(null)
    try {
      const response = await apiService.getEnrolledStudents(classSectionId)
      if (response.success && response.data) {
        setEnrolledStudents(response.data)
      }
    } catch (error) {
      setStudentsError('학생 목록을 불러오는데 실패했습니다.')
      console.error('수강 인원 조회 오류:', error)
    } finally {
      setIsLoadingStudents(false)
    }
  }, [])

  // selectedClass가 변경될 때 수강 인원 데이터 로딩
  useEffect(() => {
    if (selectedClass?.id) {
      fetchEnrolledStudents(selectedClass.id)
    } else {
      setEnrolledStudents([])
      setStudentsError(null)
    }
  }, [selectedClass?.id, fetchEnrolledStudents])

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
            
            {/* 수강 인원 */}
            <div className="enrolled-students-section">
              <h3>수강 인원</h3>
              {isLoadingStudents ? (
                <div className="loading-students">
                  <Label variant="secondary" size="medium">
                    학생 목록을 불러오는 중...
                  </Label>
                </div>
              ) : studentsError ? (
                <div className="error-students">
                  <Label variant="secondary" size="medium" style={{ color: '#dc3545' }}>
                    {studentsError}
                  </Label>
                </div>
              ) : enrolledStudents.length === 0 ? (
                <div className="empty-students">
                  <Label variant="secondary" size="medium">
                    등록된 학생이 없습니다.
                  </Label>
                </div>
              ) : (
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>학생명</th>
                      <th>학교</th>
                      <th>학년</th>
                      <th>학생 전화번호</th>
                      <th>학부모 전화번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>-</td>
                        <td>{student.grade}</td>
                        <td>{student.contactInfo?.phone || '-'}</td>
                        <td>-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                    onClassClick={handleClassClick}
                    showTimeLabels={true}
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
      
      {/* 수업 상세 정보 모달 */}
      <ClassDetailModal
        isOpen={isClassDetailModalOpen}
        onClose={handleCloseClassDetailModal}
        classSectionId={selectedClassId}
        onColorSaved={handleClassColorSaved}
        showColorPicker={true}
        showStudentList={true}
      />
    </div>
  )
}