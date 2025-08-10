import { useState } from 'react'
import type { Student } from '@shared/types'

interface UseAttendanceEditingReturn {
  editingMode: 'none' | 'remove' | 'move'
  isEditing: boolean
  sourceSeatId: string | null
  assigningStudentId: string | null
  selectedStudent: Student | null
  isStudentPanelOpen: boolean
  setEditingMode: (mode: 'none' | 'remove' | 'move') => void
  startEditing: (mode: 'remove' | 'move') => void
  stopEditing: () => void
  setSourceSeatId: (seatId: string | null) => void
  setAssigningStudentId: (studentId: string | null) => void
  setSelectedStudent: (student: Student | null) => void
  setIsStudentPanelOpen: (isOpen: boolean) => void
  handleSeatClick: (
    seatId: string,
    seatAssignments: any[],
    students: any[],
    onRemove: (seatId: string) => void,
    onSwap: (seatId1: string, seatId2: string) => void
  ) => void
}

export const useAttendanceEditing = (): UseAttendanceEditingReturn => {
  const [editingMode, setEditingMode] = useState<'none' | 'remove' | 'move'>('none')
  const [isEditing, setIsEditing] = useState(false)
  const [sourceSeatId, setSourceSeatId] = useState<string | null>(null)
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false)

  const startEditing = (mode: 'remove' | 'move') => {
    setEditingMode(mode)
    setIsEditing(true)
    // 편집 시작 시 기존 상태 초기화
    setIsStudentPanelOpen(false)
    setSelectedStudent(null)
    setAssigningStudentId(null)
    setSourceSeatId(null)
  }

  const stopEditing = () => {
    setEditingMode('none')
    setIsEditing(false)
    setSourceSeatId(null)
  }

  const handleSeatClick = (
    seatId: string,
    seatAssignments: any[],
    students: any[],
    onRemove: (seatId: string) => void,
    onSwap: (seatId1: string, seatId2: string) => void
  ) => {
    console.log('🖱️ === 좌석 클릭 이벤트 시작 ===');
    console.log('📍 클릭된 좌석:', { seatId });
    console.log('🎭 현재 편집 모드:', editingMode);
    console.log('📊 입력 데이터:', {
      seatAssignmentsCount: seatAssignments.length,
      studentsCount: students.length,
      seatAssignments: seatAssignments.filter(a => a.seatId === seatId),
      allSeatAssignments: seatAssignments
    });
    
    // 편집 모드별 동작 처리
    if (editingMode === 'remove') {
      console.log('🗑️ === 제거 모드 동작 시작 ===');
      // 제거 모드: 자리에 학생이 있으면 제거
      const assignment = seatAssignments.find(a => a.seatId === seatId);
      console.log('🔍 좌석 배정 정보 검색 결과:', {
        found: !!assignment,
        assignment: assignment,
        seatId: seatId
      });
      
      if (assignment && assignment.studentId) {
        console.log('✅ 제거 모드: 학생 제거 실행', {
          studentId: assignment.studentId,
          seatId: seatId,
          assignment: assignment
        });
        onRemove(seatId);
      } else {
        console.log('ℹ️ 제거 모드: 해당 자리에 학생이 없습니다', {
          seatId: seatId,
          assignment: assignment
        });
      }
      console.log('🗑️ === 제거 모드 동작 완료 ===');
      return;
    }
    
    if (editingMode === 'move') {
      console.log('🔄 === 이동 모드 동작 시작 ===');
      // 이동 모드: 첫 번째 자리 선택 또는 두 번째 자리로 이동/교환
      if (!sourceSeatId) {
        // 첫 번째 자리 선택
        const assignment = seatAssignments.find(a => a.seatId === seatId);
        console.log('🎯 이동 모드: 첫 번째 자리 선택 시도', {
          seatId: seatId,
          assignment: assignment,
          hasStudent: assignment && assignment.studentId
        });
        
        if (assignment && assignment.studentId) {
          console.log('✅ 이동 모드: 소스 자리 선택됨', {
            seatId: seatId,
            studentId: assignment.studentId
          });
          setSourceSeatId(seatId);
        } else {
          console.log('⚠️ 이동 모드: 빈 자리는 선택할 수 없습니다', {
            seatId: seatId,
            assignment: assignment
          });
        }
      } else if (sourceSeatId !== seatId) {
        // 두 번째 자리 클릭 - 이동/교환 실행
        console.log('🔄 이동 모드: 이동/교환 실행', {
          sourceSeatId: sourceSeatId,
          targetSeatId: seatId,
          sourceAssignment: seatAssignments.find(a => a.seatId === sourceSeatId),
          targetAssignment: seatAssignments.find(a => a.seatId === seatId)
        });
        onSwap(sourceSeatId, seatId);
        setSourceSeatId(null); // 선택 상태 초기화
        console.log('✅ 이동/교환 완료, 소스 자리 선택 상태 초기화');
      }
      console.log('🔄 === 이동 모드 동작 완료 ===');
      return;
    }
    
    // 일반 모드: 기존 동작 (학생 정보 패널 열기)
    console.log('👤 === 일반 모드 동작 시작 ===');
    const assignment = seatAssignments.find(a => a.seatId === seatId);
    console.log('🔍 일반 모드: 좌석 배정 정보 검색', {
      found: !!assignment,
      assignment: assignment,
      seatId: seatId
    });
    
    if (assignment && assignment.studentId) {
      const student = students.find(s => s.id === assignment.studentId);
      console.log('👤 일반 모드: 학생 정보 검색', {
        found: !!student,
        student: student,
        studentId: assignment.studentId,
        allStudents: students.map(s => ({ id: s.id, name: s.name }))
      });
      
      if (student) {
        console.log('✅ 일반 모드: 학생 정보 패널 열기', {
          student: student,
          studentId: assignment.studentId,
          actualId: assignment.studentId
        });
        setSelectedStudent({ ...student, actualId: assignment.studentId } as any);
        setIsStudentPanelOpen(true);
      } else {
        console.error('❌ 일반 모드: 학생을 찾을 수 없습니다', {
          studentId: assignment.studentId,
          availableStudentIds: students.map(s => s.id)
        });
      }
    } else {
      console.log('ℹ️ 일반 모드: 좌석에 배정된 학생이 없습니다', {
        seatId: seatId,
        assignment: assignment
      });
    }
    console.log('👤 === 일반 모드 동작 완료 ===');
    console.log('🖱️ === 좌석 클릭 이벤트 완료 ===');
  }

  return {
    editingMode,
    isEditing,
    sourceSeatId,
    assigningStudentId,
    selectedStudent,
    isStudentPanelOpen,
    setEditingMode,
    startEditing,
    stopEditing,
    setSourceSeatId,
    setAssigningStudentId,
    setSelectedStudent,
    setIsStudentPanelOpen,
    handleSeatClick
  }
}
