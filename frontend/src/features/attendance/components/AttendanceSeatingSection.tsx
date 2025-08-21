import { BaseWidget } from '../../../components/base/BaseWidget'
import { SeatGrid } from '../../../components/business/attendance/SeatGrid'
import type { Seat, SeatAssignment } from '@shared/types'
import type { SeatWithStudent } from '../types/attendance.types'
import './AttendanceSeatingSection.css'

interface AttendanceSeatingSectionProps {
  seats: Seat[] // Seat 타입으로 변경
  seatAssignments: SeatAssignment[]
  students: any[]
  isEditing: boolean
  currentMode: 'view' | 'edit'
  assigningStudentId: string | null
  onSeatClick: (seatId: string) => void
  onSeatAssign: (seatId: string, studentId: string) => Promise<void>
  onSeatClear: (seatId: string) => Promise<void>
  onSeatSwap: (seatId1: string, seatId2: string) => Promise<void>
  onAssignedDone: () => void
  getStudentName: (seatId: string) => string
  isAddingMode: boolean // 추가
  pendingSeatId: string | null // 추가
}

export const AttendanceSeatingSection = ({
  seats,
  seatAssignments,
  students,
  isEditing,
  currentMode,
  assigningStudentId,
  onSeatClick,
  onSeatAssign,
  onSeatClear,
  onSeatSwap,
  onAssignedDone,
  getStudentName,
  isAddingMode, // 추가
  pendingSeatId // 추가
}: AttendanceSeatingSectionProps) => {
  // 새로운 스키마에 맞게 좌석 데이터 변환
  const transformedSeats = seats.map(seat => {
    // seatAssignments에서 해당 좌석의 배정 정보 찾기
    const assignment = seatAssignments.find(a => a.seatId === seat.id)
    const student = assignment ? students.find(s => s.id === assignment.studentId) : undefined
    
    // 중요: seat.status는 useAttendanceData에서 이미 출석 상태로 업데이트됨
    // assignment.status는 좌석 배정 상태이므로 사용하지 않음
    const actualStatus = (seat.status as any) || 'dismissed'
         
    return {
      ...seat,
      id: seat.id, // 원래 id 사용
      studentId: assignment?.studentId,
      studentName: student?.name || '미배정',
      status: actualStatus // 실제 출석 상태 사용
    }
  })

  return (
    <BaseWidget className="seating-section">
      <SeatGrid
        seats={transformedSeats}
        getStudentName={getStudentName}
        onSeatClick={onSeatClick}
        onSeatHover={currentMode === 'view' ? (seatId: string) => console.log(`자리 ${seatId} 호버`) : undefined}
        onSeatFocus={currentMode === 'view' ? (seatId: string) => console.log(`자리 ${seatId} 포커스`) : undefined}
        className={`${currentMode === 'edit' ? 'editing' : 'viewing'} ${isEditing ? 'editing-active' : ''}`}
        isEditable={currentMode === 'edit' && isEditing}
        onSeatAssign={onSeatAssign}
        onSeatClear={onSeatClear}
        onSeatSwap={onSeatSwap}
        assigningStudentId={assigningStudentId}
        onAssignedDone={onAssignedDone}
        isAddingMode={isAddingMode} // 추가
        pendingSeatId={pendingSeatId} // 추가
      />
    </BaseWidget>
  )
}
