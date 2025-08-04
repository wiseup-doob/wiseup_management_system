import { forwardRef } from 'react'
import { BaseButton } from '../../base/BaseButton'
import { getAttendanceVariant } from '../../../utils/attendance.utils'
import type { AttendanceStatus } from '../../../features/attendance/types/attendance.types'
import type { BaseButtonProps } from '../../../types/components'
import './SeatButton.css'

export interface SeatButtonProps extends Omit<BaseButtonProps, 'variant'> {
  seatId: string
  status: AttendanceStatus
  studentName: string
  onSeatClick: (seatId: string) => void
  onSeatHover?: (seatId: string) => void
  onSeatFocus?: (seatId: string) => void
}

export const SeatButton = forwardRef<HTMLButtonElement, SeatButtonProps>(
  ({ 
    seatId, 
    status, 
    studentName, 
    onSeatClick, 
    onSeatHover, 
    onSeatFocus,
    className = '',
    size = 'small',
    ...props 
  }, ref) => {
    
    const handleClick = () => {
      onSeatClick(seatId)
    }

    const handleHover = () => {
      onSeatHover?.(seatId)
    }

    const handleFocus = () => {
      onSeatFocus?.(seatId)
    }

    return (
      <BaseButton
        ref={ref}
        variant={getAttendanceVariant(status)}
        size={size}
        className={`seat-button ${className}`}
        onClick={handleClick}
        onHover={handleHover}
        onFocus={handleFocus}
        {...props}
      >
        <span className="seat-student-name">{studentName}</span>
      </BaseButton>
    )
  }
)

SeatButton.displayName = 'SeatButton' 