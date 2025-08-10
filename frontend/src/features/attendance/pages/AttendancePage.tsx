import './AttendancePage.css'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { Button } from '../../../components/buttons/Button'
import { StudentInfoPanel } from '../../../components/business/studentInfo/StudentInfoPanel'
import { AttendanceHeader } from '../components/AttendanceHeader'
import { AttendanceSearchSection } from '../components/AttendanceSearchSection'
import { AttendanceSeatingSection } from '../components/AttendanceSeatingSection'
import { useAttendance } from '../hooks/useAttendance'
import { useAttendanceData } from '../hooks/useAttendanceData'
import { useAttendanceActions } from '../hooks/useAttendanceActions'
import { useAttendanceEditing } from '../hooks/useAttendanceEditing'
import { useAttendanceHealth } from '../hooks/useAttendanceHealth'
import type { AttendanceStatus } from '@shared/types/common.types'
import { useState } from 'react'

function AttendancePage() {
  const { 
    seats, 
    students,
    seatAssignments,
    searchTerm, 
    updateSeat, 
    updateStudents,
    updateSeatAssignments,
    updateStudentAttendanceStatus,
    handleSearchChange,
    updateSeats 
  } = useAttendance()

  const [isAddingMode, setIsAddingMode] = useState(false)
  const [pendingSeatId, setPendingSeatId] = useState<string | null>(null)

  // 데이터 로딩 훅
  const { loading, error, dataEmpty, fetchData } = useAttendanceData(
    updateStudents,
    updateSeats,
    updateSeatAssignments
  )

  // 액션 훅
  const { 
    error: actionError, 
    setError: setActionError,
    assignSeat, 
    clearSeat, 
    swapSeats, 
    handleAttendanceChange
  } = useAttendanceActions(fetchData, updateStudentAttendanceStatus)

  // 편집 모드 훅
  const {
    editingMode,
    isEditing,
    sourceSeatId,
    assigningStudentId,
    selectedStudent,
    isStudentPanelOpen,
    startEditing,
    stopEditing,
    setAssigningStudentId,
    setSelectedStudent,
    setIsStudentPanelOpen,
    handleSeatClick: handleSeatClickBase
  } = useAttendanceEditing()

  // 헬스체크 훅
  const {
    seatHealth,
    isCheckingHealth,
    isRepairing,
    checkHealth,
    autoRepair
  } = useAttendanceHealth(fetchData)

  // 학생 이름 조회 함수 (seatAssignments 기반)
  const getStudentName = (seatId: string, seatAssignments: any[], students: any[]): string => {
    // 해당 좌석의 활성 배정 찾기
    const assignment = seatAssignments.find(a => a.seatId === seatId && a.status === 'present')
    if (!assignment) return ''
    
    // 학생 정보에서 이름 찾기
    const student = students.find(s => s.id === assignment.studentId)
    return student ? student.name : '미배정'
  }

  // 에러 상태 통합
  const currentError = error || actionError

  // 좌석 클릭 핸들러
  const handleSeatClick = (seatId: string) => {
    console.log('🎯 === AttendancePage handleSeatClick 시작 ===');
    console.log('📍 입력 파라미터:', { seatId });
    console.log('📊 현재 상태:', {
      editingMode,
      isEditing,
      sourceSeatId,
      seatAssignmentsCount: seatAssignments.length,
      studentsCount: students.length
    });
    
    // 추가 모드일 때의 처리
    if (isAddingMode) {
      console.log('➕ 추가 모드: 좌석 선택됨', seatId);
      setPendingSeatId(seatId)
      return
    }

    console.log('🔄 useAttendanceEditing.handleSeatClick 호출 시작');
    handleSeatClickBase(
      seatId,
      seatAssignments,
      students,
      clearSeat,
      swapSeats
    );
    console.log('✅ useAttendanceEditing.handleSeatClick 호출 완료');
    console.log('🎯 === AttendancePage handleSeatClick 완료 ===');
  }

  // 학생 패널 닫기
  const handleCloseStudentPanel = () => {
    setIsStudentPanelOpen(false)
    setSelectedStudent(null)
  }

  // 출결 상태 변경 핸들러
  const handleAttendanceChangeWrapper = async (status: AttendanceStatus) => {
    if (!selectedStudent) return
    
    await handleAttendanceChange(selectedStudent, status, () => {
      setIsStudentPanelOpen(false)
      setSelectedStudent(null)
    })
  }

  // 편집 모드 변경 핸들러
  const handleEditModeChange = (mode: 'remove' | 'move') => {
    startEditing(mode)
  }

  // 편집 완료 핸들러
  const handleEditComplete = () => {
    stopEditing()
  }

  // 학생 배정 핸들러
  const handleAssignStudent = (studentId: string) => {
    if (isAddingMode && pendingSeatId) {
      // 추가 모드: 대기 중인 좌석에 배정
      console.log('➕ 추가 모드: 학생 배정 실행', { studentId, seatId: pendingSeatId });
      assignSeat(pendingSeatId, studentId)
      setPendingSeatId(null)
      setIsAddingMode(false)
    } else {
      // 기존 방식: assigningStudentId 설정
      setAssigningStudentId(studentId)
    }
  }

  // 학생 패널 열기 핸들러
  const handleOpenStudentPanel = (student: any) => {
    setSelectedStudent(student)
    setIsStudentPanelOpen(true)
  }

  // 좌석 추가 모드 토글
  const handleToggleAddingMode = (mode: boolean) => {
    setIsAddingMode(mode)
    setPendingSeatId(null)
    if (!mode) {
      // 모드 종료 시 검색어 초기화
      handleSearchChange('')
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <BaseWidget className="attendance-page">
        <Label 
          variant="heading" 
          size="large" 
          className="page-title"
        >
          출결 관리
        </Label>
        <BaseWidget className="loading-section">
          <Label 
            variant="default" 
            size="medium" 
            className="loading-text"
          >
            데이터를 불러오는 중...
          </Label>
        </BaseWidget>
      </BaseWidget>
    )
  }

  // 에러 상태
  if (currentError) {
    return (
      <BaseWidget className="attendance-page">
        <Label 
          variant="heading" 
          size="large" 
          className="page-title"
        >
          출결 관리
        </Label>
        <BaseWidget className="error-section">
          <Label 
            variant="error" 
            size="medium" 
            className="error-text"
          >
            {currentError}
          </Label>
          <BaseWidget className="error-actions">
            <Button 
              variant="primary" 
              size="medium" 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              다시 시도
            </Button>
          </BaseWidget>
        </BaseWidget>
      </BaseWidget>
    )
  }

  // 데이터 없음 상태
  if (dataEmpty) {
    return (
      <BaseWidget className="attendance-page">
        <Label 
          variant="heading" 
          size="large" 
          className="page-title"
        >
          출결 관리
        </Label>
        <BaseWidget className="empty-section">
          <Label 
            variant="default" 
            size="medium" 
            className="empty-text"
          >
            데이터가 없습니다.
          </Label>
          <Label 
            variant="secondary" 
            size="small" 
            className="empty-hint"
          >
            Firebase Emulator를 시작할 때 자동으로 데이터가 초기화됩니다.
          </Label>
          <Label 
            variant="secondary" 
            size="small" 
            className="empty-hint"
          >
            터미널에서 ./dev.sh를 실행해주세요.
          </Label>
          <BaseWidget className="empty-actions">
            <Button 
              variant="primary" 
              size="medium" 
              onClick={fetchData}
              className="retry-button"
            >
              새로고침
            </Button>
          </BaseWidget>
        </BaseWidget>
      </BaseWidget>
    )
  }

  return (
    <>
      <BaseWidget className={`attendance-page ${isStudentPanelOpen ? 'with-side-panel' : ''}`}>
        <Label 
          variant="heading" 
          size="large" 
          className="page-title"
        >
          출결 관리
        </Label>
        
        {/* 헤더 컴포넌트 */}
        <AttendanceHeader
          editingMode={editingMode}
          isEditing={isEditing}
          sourceSeatId={sourceSeatId}
          onRefresh={fetchData}
          onEditModeChange={handleEditModeChange}
          onEditComplete={handleEditComplete}
          onCheckHealth={checkHealth}
          onAutoRepair={autoRepair}
          isCheckingHealth={isCheckingHealth}
          isRepairing={isRepairing}
          seatHealth={seatHealth}
        />
        
        {/* 검색 섹션 컴포넌트 */}
        <AttendanceSearchSection
          searchTerm={searchTerm}
          students={students}
          isEditing={isEditing}
          isAddingMode={isAddingMode}
          onSearchChange={handleSearchChange}
          onSearch={() => {}} // SearchInput에서 직접 처리
          onSelectSuggestion={() => {}} // SearchInput에서 직접 처리
          onAssignStudent={handleAssignStudent}
          onOpenStudentPanel={handleOpenStudentPanel}
          onToggleAddingMode={handleToggleAddingMode}
        />
        
        {/* 좌석 배치 섹션 컴포넌트 */}
        <AttendanceSeatingSection
          seats={seats}
          seatAssignments={seatAssignments}
          students={students}
          isEditing={isEditing}
          assigningStudentId={assigningStudentId}
          onSeatClick={handleSeatClick}
          onSeatAssign={assignSeat}
          onSeatClear={clearSeat}
          onSeatSwap={swapSeats}
          onAssignedDone={() => setAssigningStudentId(null)}
          getStudentName={(seatId) => getStudentName(seatId, seatAssignments, students)}
          isAddingMode={isAddingMode} // 추가 모드 상태 전달
          pendingSeatId={pendingSeatId} // 대기 중인 좌석 ID 전달
        />
      </BaseWidget>

      {/* 학생 정보 사이드 패널 */}
      <StudentInfoPanel
        student={selectedStudent}
        isOpen={!isEditing && isStudentPanelOpen}
        onClose={handleCloseStudentPanel}
        onAttendanceChange={handleAttendanceChangeWrapper}
      />
    </>
  )
}

export default AttendancePage 