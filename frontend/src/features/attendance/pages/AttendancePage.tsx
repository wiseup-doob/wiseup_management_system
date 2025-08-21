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
import type { AttendanceStatus } from '@shared/types'
import { useState } from 'react'
import type { Student } from '@shared/types'
import { apiService } from '../../../services/api'

// 변경사항 추적을 위한 타입 정의
interface ChangeRecord {
  type: 'assign' | 'unassign' | 'swap' | 'move'
  seatId: string
  studentId?: string
  targetSeatId?: string
  timestamp: number
}

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

  // 모드 기반 분리를 위한 상태
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>('view')
  const [pendingChanges, setPendingChanges] = useState<ChangeRecord[]>([])
  
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
    isAssigning,
    isUnassigning,
    isSwapping,
    isUpdatingStatus,
    assignStudentToSeat, 
    unassignStudentFromSeat, 
    swapSeats, 
    updateSeatStatus,
    checkSeatHealth,
    autoRepairSeats
  } = useAttendanceActions()

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

  // 출석 상태 변경 처리 함수
  const handleAttendanceChange = async (status: AttendanceStatus) => {
    if (!selectedStudent) return
    
    try {
      console.log(`출석 상태 변경: ${selectedStudent.name} -> ${status}`)
      
      // 백엔드 API 호출하여 출석 기록 생성/업데이트
      const today = new Date().toISOString().split('T')[0]
      const response = await apiService.createAttendanceRecord({
        studentId: selectedStudent.id,
        date: today,
        status: status,
        timestamp: new Date().toISOString(),
        checkInTime: status === 'present' ? new Date().toISOString() : undefined,
        checkOutTime: status === 'dismissed' ? new Date().toISOString() : undefined,
        notes: `상태 변경: ${status}`
      })
      
      if (response.success) {
        console.log('✅ 출석 상태 변경 성공')
        
        // 로컬 상태 업데이트
        updateStudentAttendanceStatus(selectedStudent.id, status)
        
        // 해당 학생이 배정된 좌석의 상태를 즉시 업데이트
        const studentAssignment = seatAssignments.find(a => a.studentId === selectedStudent.id)
        if (studentAssignment) {
          const updatedSeats = seats.map(seat => {
            if (seat.id === studentAssignment.seatId) {
              return {
                ...seat,
                status: status as any // AttendanceStatus를 SeatStatus로 타입 캐스팅
              }
            }
            return seat
          })
          updateSeats(updatedSeats)
          console.log('✅ 좌석 상태 즉시 업데이트 완료')
        }
        
        // 전체 데이터 새로고침 (백그라운드에서)
        setTimeout(() => {
          fetchData()
        }, 100)
        
        // 성공 메시지 표시 (선택사항)
        alert(`${selectedStudent.name}의 출석 상태가 ${status}로 변경되었습니다.`)
      } else {
        console.error('❌ 출석 상태 변경 실패:', response.error)
        alert('출석 상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 출석 상태 변경 오류:', error)
      alert('출석 상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 전체 좌석 그리드 생성 함수 (6x8 = 48개 좌석)
  const generateAllSeats = () => {
    const allSeats = []
    for (let row = 1; row <= 6; row++) {
      for (let col = 1; col <= 8; col++) {
        const seatNumber = (row - 1) * 8 + col
        const existingSeat = seats.find(s => s.seatNumber === seatNumber)
        
        if (existingSeat) {
          // 기존 좌석이 있으면 그대로 사용
          allSeats.push(existingSeat)
        } else {
          // 할당되지 않은 좌석 생성
          allSeats.push({
            id: `seat_${seatNumber}`,
            seatId: `seat_${seatNumber}`,
            seatNumber,
            row,
            col,
            status: 'vacant' as any,
            isActive: true,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as any)
        }
      }
    }
    return allSeats
  }

  // 학생 이름 조회 함수 (백엔드 데이터 구조에 맞춰 수정)
  const getStudentName = (seatId: string): string => {
    // 해당 좌석의 활성 배정 찾기
    const assignment = seatAssignments.find(a => a.seatId === seatId)
    if (!assignment) return ''
    
    // assignment에서 studentName을 직접 사용하거나, students에서 찾기
    if (assignment.studentName) {
      return assignment.studentName
    }
    
    // students에서 찾기
    const student = students.find(s => s.id === assignment.studentId)
    return student ? student.name : '미배정'
  }

  // 에러 상태 통합
  const currentError = error

  // 편집 모드 진입
  const enterEditMode = () => {
    setCurrentMode('edit')
    setPendingChanges([])
    setIsAddingMode(true) // 편집 모드 진입 시 추가 모드 활성화
    startEditing() // 기본 편집 모드로 시작
  }

  // 편집 모드 종료 (저장하지 않고)
  const cancelEditMode = () => {
    setCurrentMode('view')
    setPendingChanges([])
    setIsAddingMode(false) // 편집 모드 종료 시 추가 모드 비활성화
    stopEditing()
  }



  // 변경사항 추가
  const addPendingChange = (change: Omit<ChangeRecord, 'timestamp'>) => {
    if (currentMode === 'edit') {
      const changeRecord: ChangeRecord = {
        ...change,
        timestamp: Date.now()
      }
      setPendingChanges(prev => [...prev, changeRecord])
    }
  }

  // 편집 완료 시 변경사항 저장
  const handleEditComplete = async () => {
    try {
      // pendingChanges가 있으면 실제로 저장
      if (pendingChanges.length > 0) {
        console.log('💾 편집 완료: 변경사항 저장 시작', pendingChanges)
        
        // 변경사항을 순차적으로 적용
        for (const change of pendingChanges) {
          switch (change.type) {
            case 'assign':
              if (change.studentId) {
                await assignStudentToSeat(change.seatId, change.studentId)
              }
              break
            case 'unassign':
              await unassignStudentFromSeat(change.seatId)
              break
            case 'swap':
              if (change.targetSeatId) {
                await swapSeats(change.seatId, change.targetSeatId)
              }
              break
            case 'move':
              if (change.studentId && change.targetSeatId) {
                await assignStudentToSeat(change.targetSeatId, change.studentId)
              }
              break
          }
        }
        
        // 변경사항 초기화
        setPendingChanges([])
      }
      
      // 편집 모드 종료
      setCurrentMode('view')
      setIsAddingMode(false) // 편집 모드 종료 시 추가 모드 비활성화
      stopEditing()
      
      // 데이터 새로고침
      await fetchData()
      
    } catch (error) {
      console.error('편집 완료 실패:', error)
    }
  }

  // 좌석 클릭 핸들러
  const handleSeatClick = (seatId: string) => {
    console.log('🎯 === AttendancePage handleSeatClick 시작 ===');
    console.log('📍 입력 파라미터:', { seatId });
    console.log('📊 현재 상태:', {
      currentMode,
      editingMode,
      isEditing,
      sourceSeatId,
      seatAssignmentsCount: seatAssignments.length,
      studentsCount: students.length
    });
    
    // 추가 모드일 때의 처리
    if (isAddingMode) {
      console.log('➕ 추가 모드: 좌석 선택됨', seatId);
      setPendingSeatId(seatId);
      return;
    }

    // 편집 모드일 때의 처리
    if (currentMode === 'edit' && isEditing) {
      console.log('✏️ 편집 모드: 좌석 클릭 처리');
      handleSeatClickBase(seatId);
      return;
    }

    // 조회 모드일 때의 처리 (편집 중이 아닐 때)
    if (!isEditing) {
      console.log('👁️ 조회 모드: 학생 정보 패널 열기');
      const assignment = seatAssignments.find(a => a.seatId === seatId);
      if (assignment && assignment.studentId) {
        const student = students.find(s => s.id === assignment.studentId);
        if (student) {
          console.log('✅ 학생 정보 패널 열기:', student.name);
          setSelectedStudent(student);
          setIsStudentPanelOpen(true);
        } else {
          console.warn('⚠️ 학생을 찾을 수 없음:', assignment.studentId);
        }
      } else {
        console.warn('⚠️ 좌석 배정 정보를 찾을 수 없음:', seatId);
      }
      return;
    }
  }

  // 학생 배정 핸들러
  const handleStudentAssign = async (seatId: string, studentId: string) => {
    try {
      console.log('🎯 학생 배정 시작:', { seatId, studentId });
      
      // 변경사항 기록
      addPendingChange({
        type: 'assign',
        seatId,
        studentId
      });
      
      // 실제 배정 실행
      const success = await assignStudentToSeat(seatId, studentId);
      if (success) {
        console.log('✅ 학생 배정 성공');
        // 데이터 새로고침
        await fetchData();
      } else {
        console.error('❌ 학생 배정 실패');
      }
    } catch (error) {
      console.error('학생 배정 중 오류 발생:', error);
    }
  }

  // 좌석 배정 해제 핸들러
  const handleSeatClear = async (seatId: string) => {
    try {
      console.log('🗑️ 좌석 배정 해제 시작:', seatId);
      
      // 변경사항 기록
      addPendingChange({
        type: 'unassign',
        seatId
      });
      
      // 실제 해제 실행
      const success = await unassignStudentFromSeat(seatId);
      if (success) {
        console.log('✅ 좌석 배정 해제 성공');
        // 데이터 새로고침
        await fetchData();
      } else {
        console.error('❌ 좌석 배정 해제 실패');
      }
    } catch (error) {
      console.error('좌석 배정 해제 중 오류 발생:', error);
    }
  }

  // 좌석 교환 핸들러
  const handleSeatSwap = async (seatId1: string, seatId2: string) => {
    try {
      console.log('🔄 좌석 교환 시작:', { seatId1, seatId2 });
      
      // 변경사항 기록
      addPendingChange({
        type: 'swap',
        seatId: seatId1,
        targetSeatId: seatId2
      });
      
      // 실제 교환 실행
      const success = await swapSeats(seatId1, seatId2);
      if (success) {
        console.log('✅ 좌석 교환 성공');
        // 데이터 새로고침
        await fetchData();
      } else {
        console.error('❌ 좌석 교환 실패');
      }
    } catch (error) {
      console.error('좌석 교환 중 오류 발생:', error);
    }
  }

  // 학생 패널 열기 핸들러
  const handleOpenStudentPanel = (student: Student) => {
    // 패널이 이미 열려있으면 내용만 업데이트
    if (isStudentPanelOpen) {
      setSelectedStudent(student);
    } else {
      // 패널이 닫혀있으면 새로 열기
      setSelectedStudent(student);
      setIsStudentPanelOpen(true);
    }
  }

  // 학생 패널 닫기 핸들러
  const handleCloseStudentPanel = () => {
    setIsStudentPanelOpen(false);
    setSelectedStudent(null);
  }

  // 편집 모드 변경 핸들러
  const handleEditModeChange = (mode: 'remove' | 'move') => {
    setAssigningStudentId(mode)
  }

  // 헬스체크 핸들러
  const handleCheckHealth = () => {
    checkHealth()
  }

  // 자동 복구 핸들러
  const handleAutoRepair = () => {
    autoRepair()
  }

  // 추가 모드 토글 핸들러
  const handleToggleAddingMode = () => {
    setIsAddingMode(!isAddingMode)
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="attendance-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러가 있을 때
  if (currentError) {
    return (
      <div className="attendance-page error">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>{currentError}</p>
          <button onClick={fetchData} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (dataEmpty) {
    return (
      <div className="attendance-page empty">
        <div className="empty-message">
          <h2>데이터가 없습니다</h2>
          <p>학생 데이터를 먼저 등록해주세요.</p>
          <button onClick={fetchData} className="retry-button">
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`attendance-page ${isStudentPanelOpen ? 'with-side-panel' : ''}`}>
      {/* 헤더 섹션 */}
      <AttendanceHeader
        editingMode={editingMode}
        isEditing={isEditing}
        sourceSeatId={sourceSeatId}
        currentMode={currentMode}
        pendingChangesCount={pendingChanges.length}
        isAddingMode={isAddingMode}
        onRefresh={fetchData}
        onEditModeChange={handleEditModeChange}
        onEditComplete={handleEditComplete}
        onEnterEditMode={enterEditMode}
        onCancelEditMode={cancelEditMode}
        onToggleAddingMode={() => setIsAddingMode(!isAddingMode)}
        onCheckHealth={handleCheckHealth}
        onAutoRepair={handleAutoRepair}
        isCheckingHealth={isCheckingHealth}
        isRepairing={isRepairing}
        seatHealth={seatHealth}
      />

      {/* 검색 섹션 */}
      <AttendanceSearchSection
        searchTerm={searchTerm}
        students={students}
        isAddingMode={isAddingMode}
        currentMode={currentMode}
        onSearchChange={handleSearchChange}
        onSearch={() => {}} // 검색 기능은 handleStudentAssign으로 대체
        onSelectSuggestion={() => {}} // 제안 선택 기능은 handleStudentAssign으로 대체
        onAssignStudent={(studentId: string) => {
          if (pendingSeatId) {
            handleStudentAssign(pendingSeatId, studentId);
          }
        }}
        onOpenStudentPanel={handleOpenStudentPanel}
        onToggleAddingMode={handleToggleAddingMode}
      />

      {/* 좌석 배치 섹션 */}
      <AttendanceSeatingSection
        seats={generateAllSeats()}
        seatAssignments={seatAssignments}
        students={students}
        isEditing={isEditing}
        currentMode={currentMode}
        assigningStudentId={assigningStudentId}
        onSeatClick={handleSeatClick}
        onSeatAssign={handleStudentAssign}
        onSeatClear={handleSeatClear}
        onSeatSwap={handleSeatSwap}
        onAssignedDone={() => {
          setAssigningStudentId(null);
          setPendingSeatId(null);
        }}
        getStudentName={getStudentName}
        isAddingMode={isAddingMode}
        pendingSeatId={pendingSeatId}
      />

      {/* 학생 정보 패널 */}
      {isStudentPanelOpen && selectedStudent && (
        <StudentInfoPanel
          student={selectedStudent}
          isOpen={isStudentPanelOpen}
          onClose={handleCloseStudentPanel}
          onAttendanceChange={handleAttendanceChange}
        />
      )}
    </div>
  );
}

export default AttendancePage 