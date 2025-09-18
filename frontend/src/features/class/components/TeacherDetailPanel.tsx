import React, { useMemo, useState, useCallback, useEffect } from 'react'
import './TeacherDetailPanel.css'
import type { ClassSectionWithDetails, ClassSectionWithStudents, EnrolledStudent } from '../types/class.types'
import { TimetableWidget, TimetableSkeleton } from '../../../components/business/timetable'
import { ClassDetailModal } from '../../../components/business/ClassDetailModal'
import { apiService } from '../../../services/api'

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

  // 수강생 정보 관련 상태
  const [classesWithStudents, setClassesWithStudents] = useState<ClassSectionWithStudents[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [studentStatistics, setStudentStatistics] = useState<any>(null)

  // 수강생 정보 로딩 함수
  const loadTeacherClassesWithStudents = useCallback(async () => {
    setIsLoadingStudents(true)
    setStudentsError(null)
    
    try {
      console.log('📚 선생님 수업 및 수강생 정보 로딩 시작:', teacherId)
      const response = await apiService.getTeacherClassesWithStudents(teacherId)
      
      if (response.success && response.data) {
        console.log('✅ 선생님 수업 및 수강생 정보 로딩 성공:', response.data)
        setClassesWithStudents(response.data)
        
        // 백엔드에서 계산된 통계 데이터 저장
        if (response.statistics) {
          console.log('📊 수강생 통계 데이터:', response.statistics)
          setStudentStatistics(response.statistics)
        }
      } else {
        setStudentsError(response.message || '수강생 정보를 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('❌ 선생님 수업 및 수강생 정보 로딩 실패:', error)
      setStudentsError('수강생 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoadingStudents(false)
    }
  }, [teacherId])

  // 컴포넌트 마운트 시 수강생 정보 로딩
  useEffect(() => {
    loadTeacherClassesWithStudents()
  }, [loadTeacherClassesWithStudents])

  // 색상 저장 후 수업 목록 새로고침 콜백
  const handleTeacherClassColorSaved = useCallback(() => {
    console.log('🎨 수업 색상 저장됨, 선생님 수업 목록 새로고침')
    // 선생님 수업 목록 새로고침 (props로 받은 onRefreshClasses 호출)
    onRefreshClasses?.()
    // 수강생 정보도 다시 로딩
    loadTeacherClassesWithStudents()
  }, [onRefreshClasses, loadTeacherClassesWithStudents])

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

  // 통계 계산 (기존 통계 + 백엔드 수강생 통계)
  const statistics = useMemo(() => {
    const totalClasses = classes.length
    const totalScheduleBlocks = classes.reduce((total, cls) => {
      return total + (cls.schedule?.length || 0)
    }, 0)
    const subjects = [...new Set(classes.map(cls => cls.course?.subject).filter(Boolean))]
    
    // 백엔드에서 받은 수강생 통계 데이터 병합 (필요한 것만)
    const studentStats = studentStatistics || {
      totalStudents: 0
    }
    
    return {
      totalClasses,
      totalScheduleBlocks,
      subjects: subjects as string[],
      // 백엔드에서 계산된 수강생 통계 (전체 수강생 수만)
      totalStudents: studentStats.totalStudents
    }
  }, [classes, studentStatistics])

  // 수업별 수강생 카드 컴포넌트
  const ClassStudentCard = ({ classItem, students }: { 
    classItem: ClassSectionWithDetails, 
    students: EnrolledStudent[] 
  }) => (
    <div className="teacher-class-student-card">
      <div className="teacher-class-header">
        <h4 className="teacher-class-name">{classItem.name}</h4>
        <span className="teacher-student-count">{students.length}명</span>
      </div>
      
      <div className="teacher-students-table-container">
        {students.length > 0 ? (
          <table className="teacher-students-table">
            <thead>
              <tr>
                <th>학생명</th>
                <th>학년</th>
                <th>연락처</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.grade}</td>
                  <td>{student.contactInfo?.phone || '-'}</td>
                  <td>
                    <span className={`teacher-status-badge ${student.status}`}>
                      {student.status === 'active' ? '재원' : '퇴원'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="teacher-no-students">
            <p>등록된 수강생이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="teacher-detail-panel">
      <div className="teacher-panel-header">
        <h2 className="teacher-panel-name">{teacherName} 선생님</h2>
        <button className="teacher-close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="teacher-panel-content">
        {/* 통계 카드들 */}
        <div className="teacher-stats">
          <div className="teacher-stat-card">
            <div className="teacher-stat-number">{statistics.totalClasses}</div>
            <div className="teacher-stat-label">담당 수업</div>
          </div>
          
          {/* 전체 수강생 수 */}
          <div className="teacher-stat-card">
            <div className="teacher-stat-number">{statistics.totalStudents}</div>
            <div className="teacher-stat-label">전체 수강생</div>
          </div>
        </div>

        {/* 담당 과목 */}
        {statistics.subjects.length > 0 && (
          <div className="teacher-subjects">
            <h3>담당 과목</h3>
            <div className="teacher-subject-tags">
              {statistics.subjects.map((subject: string) => (
                <span key={subject} className="teacher-subject-tag">{subject}</span>
              ))}
            </div>
          </div>
        )}
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
            <div className="teacher-no-schedule">
              <p>등록된 시간표가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 수업별 수강생 현황 */}
        <div className="teacher-classes-and-students-section">
          <h3>수업별 수강생 현황</h3>
          
          {isLoadingStudents ? (
            <div className="teacher-loading-container">
              <p>수강생 정보를 불러오는 중...</p>
            </div>
          ) : studentsError ? (
            <div className="teacher-error-container">
              <p>{studentsError}</p>
              <button onClick={loadTeacherClassesWithStudents} className="teacher-retry-button">
                다시 시도
              </button>
            </div>
          ) : classesWithStudents.length > 0 ? (
            <div className="teacher-classes-list">
              {classesWithStudents.map(classItem => (
                <ClassStudentCard
                  key={classItem.id}
                  classItem={classItem}
                  students={classItem.enrolledStudents}
                />
              ))}
            </div>
          ) : (
            <div className="teacher-no-classes">
              <p>등록된 수업이 없습니다.</p>
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