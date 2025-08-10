import { BaseWidget } from '../../../components/base/BaseWidget'
import { SeatGrid } from '../../../components/business/attendance/SeatGrid'
import type { Seat, SeatAssignment } from '@shared/types'
import type { SeatWithStudent } from '../types/attendance.types'
import './AttendanceSeatingSection.css'

interface AttendanceSeatingSectionProps {
  seats: SeatWithStudent[] // SeatWithStudent 타입으로 변경
  seatAssignments: SeatAssignment[]
  students: any[]
  isEditing: boolean
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
  students,
  isEditing,
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
    // currentAssignment에서 학생 정보 가져오기
    const assignment = seat.currentAssignment
    const student = assignment ? students.find(s => s.id === assignment.studentId) : undefined
    const actualStatus = student?.currentStatus?.currentAttendance || assignment?.status || seat.status || 'dismissed'
         
    return {
      ...seat,
      id: seat.seatId, // SeatGrid에서 사용할 id를 seatId로 설정
      studentId: assignment?.studentId,
      studentName: assignment?.studentName,
      status: actualStatus
    }
  })

  return (
    <BaseWidget className="seating-section">
      <SeatGrid
        seats={transformedSeats}
        getStudentName={getStudentName}
        onSeatClick={onSeatClick}
        onSeatHover={isEditing ? undefined : (seatId: string) => console.log(`자리 ${seatId} 호버`)}
        onSeatFocus={isEditing ? undefined : (seatId: string) => console.log(`자리 ${seatId} 포커스`)}
        className={isEditing ? 'editing' : ''}
        isEditable={isEditing}
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
