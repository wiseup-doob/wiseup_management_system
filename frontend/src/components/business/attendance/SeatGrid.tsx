import { forwardRef } from 'react'
import { BaseWidget } from '../../base/BaseWidget'
import { Grid } from '../../layout/Grid'
import { SeatButton } from './SeatButton'
import { ATTENDANCE_CONSTANTS } from '../../../constants/attendance.constants'
import type { Seat } from '../../../features/attendance/types/attendance.types'
import type { BaseWidgetProps } from '../../../types/components'
import './SeatGrid.css'

export interface SeatGridProps extends BaseWidgetProps {
  seats: Seat[]
  getStudentName: (seatId: string) => string
  onSeatClick: (seatId: string) => void
  onSeatHover?: (seatId: string) => void
  onSeatFocus?: (seatId: string) => void
  className?: string
}

export const SeatGrid = forwardRef<HTMLDivElement, SeatGridProps>(
  ({ 
    seats, 
    getStudentName, 
    onSeatClick, 
    onSeatHover, 
    onSeatFocus,
    className = '',
    ...props 
  }, ref) => {
    
    return (
      <BaseWidget
        ref={ref}
        className={`seat-arrangement-section ${className}`}
        {...props}
      >
        <Grid 
          columns={ATTENDANCE_CONSTANTS.GRID.COLUMNS} 
          rows={ATTENDANCE_CONSTANTS.GRID.ROWS} 
          gap={ATTENDANCE_CONSTANTS.GRID.GAP} 
          className="seat-grid"
        >
          {seats.map((seat) => (
            <SeatButton
              key={seat.id}
              seatId={seat.id}
              status={seat.status}
              studentName={getStudentName(seat.id)}
              onSeatClick={onSeatClick}
              onSeatHover={onSeatHover}
              onSeatFocus={onSeatFocus}
            />
          ))}
        </Grid>
      </BaseWidget>
    )
  }
)

SeatGrid.displayName = 'SeatGrid' 