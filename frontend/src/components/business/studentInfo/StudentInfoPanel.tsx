import { forwardRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BaseWidget } from '../../base/BaseWidget'
import { Button } from '../../buttons/Button'
import { Label } from '../../labels/Label'
import { BaseTab } from '../../base/BaseTab'
import { AttendanceCalendar } from '../attendance/AttendanceCalendar'
import { AttendanceHorizontalTimeline } from '../attendance/AttendanceHorizontalTimeline'
import type { Student, AttendanceRecord, AttendanceStatus } from '@shared/types'
import type { AttendanceRecord as DatabaseAttendanceRecord } from '@shared/types/database.types'
import type { BaseWidgetProps } from '../../../types/components'
import type { AttendanceTimelineItem } from '@shared/types/attendance.types'
import { ATTENDANCE_STATUS_STYLES, DEFAULT_ATTENDANCE_ACTIVITIES } from '@shared/types/attendance.types'
import { apiService } from '../../../services/api'
import { timetableService } from '../../../services/timetableService'
import { TimeTable } from '../../business/timetable/TimeTable'
import type { TimetableBlock } from '@shared/types/timetable.types'
import type { TimetableItem, TimeSlot, Class, Teacher } from '@shared/types'
import './StudentInfoPanel.css'

export interface StudentInfoPanelProps extends BaseWidgetProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onAttendanceChange: (status: AttendanceStatus) => void
}

export const StudentInfoPanel = forwardRef<HTMLDivElement, StudentInfoPanelProps>(
  ({ 
    student, 
    isOpen, 
    onClose, 
    onAttendanceChange,
    className = '',
    ...props 
  }, ref) => {
    const navigate = useNavigate()
    
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [showTimeline, setShowTimeline] = useState<boolean>(false)
    const [timelineItems, setTimelineItems] = useState<AttendanceTimelineItem[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    // 시간표 전용 상태
    const [ttLoading, setTtLoading] = useState<boolean>(false)
    const [ttError, setTtError] = useState<string | null>(null)
    const [timetableId, setTimetableId] = useState<string | null>(null)
    const [ttBlocks, setTtBlocks] = useState<TimetableBlock[]>([])
    
    console.log('=== StudentInfoPanel 렌더링 ===')
    console.log('isOpen:', isOpen)
    console.log('student:', student)
    console.log('패널 표시 여부:', isOpen && student)
    
    // 학생이 변경될 때마다 출결 데이터 로드
    useEffect(() => {
      if (student) {
        loadStudentAttendanceData(student)
        // 시간표 탭 데이터도 동시 준비(탭 전환 시 지연 없도록 선로딩)
        ensureAndLoadStudentTimetable(student.id)
      }
    }, [student])

    // 학생별 출결 데이터 로드 함수 (v2 API 사용)
    const loadStudentAttendanceData = async (currentStudent: Student) => {
      if (!currentStudent?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        console.log(`=== 학생 출결 데이터 로드 시작 ===`)
        console.log(`학생 ID: ${currentStudent.id}, 학생명: ${currentStudent.name}`)
        
        // v2 API를 사용하여 학생별 출석 기록 조회
        const response = await apiService.getAttendanceByStudent(currentStudent.id)
        console.log('API 응답:', response)
        
        if (response.success && response.data && response.data.length > 0) {
          console.log(`✅ API에서 ${response.data.length}개의 출결 기록을 가져왔습니다.`)
          setAttendanceRecords(response.data)
        } else {
          console.warn('❌ 출석 데이터 로드 실패 또는 데이터 없음:', response.error || '데이터 없음')
          console.log('📝 실제 데이터가 없어 빈 배열로 설정합니다.')
          // 실제 데이터가 없으면 빈 배열로 설정
          setAttendanceRecords([])
        }
      } catch (error) {
        console.error('❌ 출석 데이터 로드 오류:', error)
        setError('출석 데이터를 불러오는데 실패했습니다.')
        console.log('📝 오류로 인해 빈 배열로 설정합니다.')
        // 오류 시 빈 배열로 설정
        setAttendanceRecords([])
      } finally {
        setLoading(false)
      }
    }

    // ===== 시간표 탭: 학생 개인 시간표 보장 및 로드 =====
    const ensureAndLoadStudentTimetable = async (studentId: string) => {
      if (!studentId) return
      setTtLoading(true)
      setTtError(null)
      try {
        // 1) 개인 시간표 보장
        const ensured = await timetableService.ensureStudentTimetable(studentId)
        if (!ensured.success || !ensured.data) throw new Error(ensured.error || '개인 시간표 보장 실패')
        const ttId = (ensured.data as any).id as string
        setTimetableId(ttId)

        // 2) 마스터 데이터와 항목 병렬 로드
        const [slotsRes, classesRes, teachersRes, itemsRes] = await Promise.all([
          timetableService.getAllTimeSlots(),
          timetableService.getAllClasses(),
          timetableService.getAllTeachers(),
          timetableService.getTimetableItems(ttId)
        ])

        const timeSlots: TimeSlot[] = slotsRes.success && slotsRes.data ? (slotsRes.data as any) : []
        const classes: Class[] = classesRes.success && classesRes.data ? (classesRes.data as any) : []
        const teachers: Teacher[] = teachersRes.success && teachersRes.data ? (teachersRes.data as any) : []
        const items: TimetableItem[] = itemsRes.success && itemsRes.data ? (itemsRes.data as any) : []

        const findSlot = (id: string) => timeSlots.find(s => (s as any).id === id)
        const findClass = (id: string) => classes.find(c => (c as any).id === id)
        const findTeacher = (id: string) => teachers.find(t => (t as any).id === id)

        const blocks: TimetableBlock[] = items.map(item => {
          const cls = findClass(item.classId)
          const tch = findTeacher(item.teacherId)
          const slot = findSlot(item.timeSlotId)
          // 기본 시간 파싱: 슬롯 기반, 없으면 notes에서 09:00-10:00 패턴 탐색, 최종 기본값
          let startTime = (slot as any)?.startTime || '09:00'
          let endTime = (slot as any)?.endTime || '10:00'
          if (item.notes) {
            const m = item.notes.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
            if (m) {
              const sH = m[1].padStart(2,'0'); const sM = m[2];
              const eH = m[3].padStart(2,'0'); const eM = m[4];
              startTime = `${sH}:${sM}`; endTime = `${eH}:${eM}`
            }
          }
          const title = `${cls?.name || '수업'}${tch ? ` (${tch.name})` : ''}`
          return {
            id: item.id,
            title,
            dayOfWeek: item.dayOfWeek,
            startTime,
            endTime,
            notes: item.notes,
            type: 'class'
          }
        })
        setTtBlocks(blocks)
      } catch (e: any) {
        console.error('학생 시간표 로드 실패', e)
        setTtError(e?.message || '학생 시간표를 불러오지 못했습니다.')
        setTtBlocks([])
      } finally {
        setTtLoading(false)
      }
    }
    // 타임라인 데이터 생성
    const generateTimelineData = (): AttendanceTimelineItem[] => {
      const items: AttendanceTimelineItem[] = []
      const today = new Date()
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        
        const dateStr = date.toISOString().split('T')[0]
        const record = attendanceRecords.find(r => r.date === dateStr)
        
        if (record) {
          items.push({
            time: record.checkInTime || record.checkOutTime || '',
            activity: DEFAULT_ATTENDANCE_ACTIVITIES[0]?.activity || '수업',
            status: record.status,
            location: record.location || '정문'
          })
        }
      }
      
      return items
    }

    // 날짜 클릭 핸들러
    const handleDateClick = (date: string) => {
      setSelectedDate(date)
      setTimelineItems(generateTimelineData())
      setShowTimeline(true)
    }

    // 월 변경 핸들러
    const handleMonthChange = (date: Date) => {
      console.log('월 변경:', date)
      // 월 변경 시 새로운 데이터 로드 로직
    }

    // 타임라인 뒤로가기 핸들러
    const handleTimelineBackClick = () => {
      setShowTimeline(false)
      setSelectedDate('')
    }

    // 타임라인 아이템 클릭 핸들러
    const handleTimelineItemClick = (item: AttendanceTimelineItem) => {
      console.log('타임라인 아이템 클릭:', item)
    }

    // 출석 상태 정보 가져오기
    const getStatusInfo = (status: AttendanceStatus) => {
      return ATTENDANCE_STATUS_STYLES[status] || ATTENDANCE_STATUS_STYLES.present
    }

    // 현재 출석 상태에 따른 버튼 렌더링
    const renderAttendanceButtons = () => {
      if (!student) return null

      // 현재 학생의 출석 상태 확인 (올바른 경로로 접근)
      const currentStatus = student.currentStatus?.currentAttendance || 'dismissed'
      
      console.log(`학생 ${student.name}의 현재 출석 상태:`, currentStatus)
      
      // 현재 상태에 따른 버튼 결정
      let buttons: { status: AttendanceStatus; label: string; variant: string; className: string; disabled: boolean }[] = []
      
      switch (currentStatus) {
        case 'present':
          // 등원 상태 -> 하원 버튼만 표시
          buttons = [
            { status: 'dismissed', label: '하원', variant: 'secondary', className: 'dismiss-button', disabled: false }
          ]
          break
        case 'dismissed':
          // 하원 상태 -> 등원, 결석 버튼 표시
          buttons = [
            { status: 'present', label: '등원', variant: 'primary', className: 'present-button', disabled: false },
            { status: 'unauthorized_absent', label: '결석', variant: 'danger', className: 'absent-button', disabled: false }
          ]
          break
        case 'unauthorized_absent':
        case 'authorized_absent':
          // 결석 상태 -> 사유결석, 무단결석 버튼 표시
          buttons = [
            { status: 'authorized_absent', label: '사유결석', variant: 'warning', className: 'authorized-absent-button', disabled: currentStatus === 'authorized_absent' },
            { status: 'unauthorized_absent', label: '무단결석', variant: 'danger', className: 'unauthorized-absent-button', disabled: currentStatus === 'unauthorized_absent' }
          ]
          break
        default:
          // 기본 상태 -> 등원, 결석 버튼 표시
          buttons = [
            { status: 'present', label: '등원', variant: 'primary', className: 'present-button', disabled: false },
            { status: 'unauthorized_absent', label: '결석', variant: 'danger', className: 'absent-button', disabled: false }
          ]
      }
      
      return (
        <div className="attendance-buttons">
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={() => {
                console.log(`출결 상태 변경: ${currentStatus} -> ${button.status}`)
                onAttendanceChange(button.status)
              }}
              className={`attendance-button ${button.className} ${currentStatus === button.status ? 'active' : ''}`}
              disabled={loading || button.disabled}
              variant={button.variant as any}
            >
              {button.label}
            </Button>
          ))}
        </div>
      )
    }

    // 로딩 상태 렌더링
    if (loading) {
      return (
        <BaseWidget
          ref={ref}
          className={`student-info-panel loading ${className}`}
          {...props}
        >
          <div className="loading-spinner">데이터를 불러오는 중...</div>
        </BaseWidget>
      )
    }

    // 에러 상태 렌더링
    if (error) {
      return (
        <BaseWidget
          ref={ref}
          className={`student-info-panel error ${className}`}
          {...props}
        >
          <div className="error-message">{error}</div>
          <Button onClick={() => student && loadStudentAttendanceData(student)}>
            다시 시도
          </Button>
        </BaseWidget>
      )
    }

    // 패널이 닫혀있거나 학생이 없으면 렌더링하지 않음
    if (!isOpen || !student) {
      return null
    }

    return (
      <BaseWidget
        ref={ref}
        className={`student-info-panel ${isOpen ? 'open' : ''} ${className}`}
        {...props}
      >
        {/* 헤더 */}
        <div className="student-info-header">
          <div className="student-profile">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {student.name.charAt(0)}
              </div>
            </div>
            <div className="profile-info">
              <h3 className="student-name">{student.name}</h3>
              <div className="student-status">
                <div className={`status-dot ${student.currentStatus?.currentAttendance || 'dismissed'}`}></div>
                <p className="status-text">
                  {student.currentStatus?.currentAttendance === 'present' ? '등원' : 
                   student.currentStatus?.currentAttendance === 'dismissed' ? '하원' :
                   student.currentStatus?.currentAttendance === 'unauthorized_absent' ? '무단결석' :
                   student.currentStatus?.currentAttendance === 'authorized_absent' ? '사유결석' : '미등원'}
                </p>
              </div>
              <p className="student-details">
                {student.grade}학년 {student.className}반
              </p>
            </div>
          </div>
          
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 출석 버튼 */}
        {renderAttendanceButtons()}

        {/* 탭 콘텐츠 */}
        <div className="student-info-content">
          <BaseTab
            tabs={[
              {
                id: 'timetable',
                label: '시간표',
                content: (
                  <div className="timetable-section">
                    {ttLoading ? (
                      <div className="timetable-placeholder"><p>시간표 데이터를 불러오는 중...</p></div>
                    ) : ttError ? (
                      <div className="timetable-placeholder"><p style={{ color: 'red' }}>{ttError}</p></div>
                    ) : (
                      <TimeTable
                        blocks={ttBlocks}
                        eventHandlers={{
                          onCellClick: (cell) => {
                            if (!student?.id || !timetableId) return
                            navigate('/timetable/edit', { state: { studentId: student.id, timetableId, seed: cell } })
                          },
                          onBlockClick: () => {}
                        }}
                        options={{
                          responsive: true,
                          startTime: '09:00' as any,
                          endTime: '23:00' as any,
                          slotMinutes: 60
                        }}
                        className="student-timetable"
                      />
                    )}
                  </div>
                )
              },
              {
                id: 'attendance',
                label: '출결 현황',
                content: (
                  <div className="attendance-section">
                    {showTimeline ? (
                      <AttendanceHorizontalTimeline
                        selectedDate={selectedDate}
                        attendanceItems={timelineItems}
                        onBackClick={handleTimelineBackClick}
                        onItemClick={handleTimelineItemClick}
                      />
                    ) : (
                      <AttendanceCalendar
                        attendanceRecords={attendanceRecords}
                        onDateClick={handleDateClick}
                        onMonthChange={handleMonthChange}
                      />
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </BaseWidget>
    )
  }
)

StudentInfoPanel.displayName = 'StudentInfoPanel' 