import { forwardRef } from 'react'
import { BaseWidget } from '../../base/BaseWidget'
import { Grid } from '../../Layout/Grid'
import { SeatButton } from './SeatButton'
import { Label } from '../../labels/Label'
import { ATTENDANCE_CONSTANTS } from '../../../constants/attendance.constants'
import type { SeatWithStudent } from '../../../features/attendance/types/attendance.types'
import type { BaseWidgetProps } from '../../../types/components'
import type { Seat } from '@shared/types'
import './SeatGrid.css'

export interface SeatGridProps extends BaseWidgetProps {
  seats: SeatWithStudent[] // SeatWithStudent 타입으로 변경
  getStudentName: (seatId: string) => string
  onSeatClick: (seatId: string) => void
  onSeatHover?: (seatId: string) => void
  onSeatFocus?: (seatId: string) => void
  // 편집 모드
  isEditable?: boolean
  onSeatAssign?: (seatId: string, studentId: string) => void
  onSeatClear?: (seatId: string) => void
  onSeatSwap?: (aSeatId: string, bSeatId: string) => void
  assigningStudentId?: string | null
  onAssignedDone?: () => void
  className?: string
  isAddingMode?: boolean
  pendingSeatId?: string | null
}

export const SeatGrid = forwardRef<HTMLDivElement, SeatGridProps>(
  ({ 
    seats, 
    getStudentName, 
    onSeatClick, 
    onSeatHover, 
    onSeatFocus,
    className = '',
    isEditable = false,
    onSeatAssign,
    onSeatClear,
    onSeatSwap,
    assigningStudentId = null,
    onAssignedDone,
    isAddingMode = false, // 추가
    pendingSeatId = null, // 추가
    ...props 
  }, ref) => {
    
    // 6x8 그룹을 3개로 분할: 8행씩 묶어서 그룹화 (8x2 구조)
    const ordered = [...seats].sort((a, b) => (a.row - b.row) || (a.col - b.col))
    const groupRanges = [
      { startCol: 1, endCol: 2, startNum: 1, endNum: 16 },    // 1-2열: 1-16번
      { startCol: 3, endCol: 4, startNum: 17, endNum: 32 },   // 3-4열: 17-32번
      { startCol: 5, endCol: 6, startNum: 33, endNum: 48 }    // 5-6열: 33-48번
    ]
    const groups = groupRanges.map(range => (
      ordered.filter(seat => seat.col >= range.startCol && seat.col <= range.endCol)
    ))
    
    return (
      <BaseWidget
        ref={ref}
        className={`seat-arrangement-section ${className}`}
        {...props}
      >
        <div className="seat-groups-container">
          {groups.map((groupSeats, groupIndex) => (
            <BaseWidget key={groupIndex} className="seat-group">
              <Label 
                variant="heading" 
                size="small" 
                className="group-title"
              >
                {`${groupRanges[groupIndex].startNum}-${groupRanges[groupIndex].endNum}번`}
              </Label>
              <Grid 
                columns={2} 
                rows={8} 
                gap={ATTENDANCE_CONSTANTS.GRID.GAP} 
                className="seat-grid-group"
              >
                {groupSeats.map((seat) => {
                  const studentName = getStudentName(seat.id)
                  const isAssigned = studentName && studentName !== '미배정'
                  
                  return (
                    <SeatButton
                      key={seat.id}
                      seatId={seat.id}
                      status={seat.status}
                      studentName={studentName || '미배정'}
                      onSeatClick={(sid) => {
                        // 할당되지 않은 좌석은 클릭 불가
                        if (!isAssigned && !isAddingMode && !isEditable) return
                        
                        if (!isEditable && !isAddingMode) return onSeatClick(sid)
                        
                        // 추가 모드일 때의 처리
                        if (isAddingMode) {
                          onSeatClick(sid)
                          return
                        }
                        
                        // 지정 학생 배정 모드가 활성화된 경우 해당 학생을 이 좌석에 배정
                        if (assigningStudentId) {
                          onSeatAssign?.(sid, assigningStudentId)
                          onAssignedDone?.()
                          return
                        }
                        
                        // 편집 모드: 첫 클릭 선택, 두 번째 클릭 교체
                        const selected = (window as any).__editingSelectedSeat as string | undefined
                        if (!selected) {
                          ;(window as any).__editingSelectedSeat = sid
                        } else if (selected === sid) {
                          // 같은 좌석 다시 클릭 → 해제 시도
                          onSeatClear?.(sid)
                          ;(window as any).__editingSelectedSeat = undefined
                        } else {
                          onSeatSwap?.(selected, sid)
                          ;(window as any).__editingSelectedSeat = undefined
                        }
                      }}
                      onSeatHover={onSeatHover}
                      onSeatFocus={onSeatFocus}
                      disabled={!isAssigned && !isAddingMode && !isEditable}
                      // 추가 모드에서 대기 중인 좌석 시각적 표시
                      className={`${pendingSeatId === seat.id ? 'pending-seat' : ''} ${!isAssigned ? 'unassigned-seat' : ''}`}
                    />
                  )
                })}
              </Grid>
            </BaseWidget>
          ))}
        </div>
      </BaseWidget>
    )
  }
)

SeatGrid.displayName = 'SeatGrid' 