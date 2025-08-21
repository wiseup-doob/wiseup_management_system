import React from 'react'
import { BaseButton } from '../../base/BaseButton'
import { ATTENDANCE_STATUS_BUTTON_VARIANTS, ATTENDANCE_STATUS_BG_COLORS, ATTENDANCE_STATUS_TEXT_COLORS } from '../../../utils/attendance.utils'
import type { AttendanceStatus } from '@shared/types'
import type { BaseButtonProps } from '../../../types/components'
import './SeatButton.css'

export interface SeatButtonProps extends Omit<BaseButtonProps, 'variant'> {
  seatId: string
  status: AttendanceStatus
  studentName: string
  onSeatClick: (seatId: string) => void
  onSeatHover?: (seatId: string) => void
  onSeatFocus?: (seatId: string) => void
  disabled?: boolean
}

export const SeatButton = React.forwardRef<HTMLButtonElement, SeatButtonProps>(
  ({ 
    seatId, 
    status, 
    studentName, 
    onSeatClick, 
    onSeatHover, 
    onSeatFocus,
    className = '',
    size = 'small',
    disabled = false,
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

    const buttonStyle = {
      backgroundColor: ATTENDANCE_STATUS_BG_COLORS[status],
      color: ATTENDANCE_STATUS_TEXT_COLORS[status],
      '--hover-color': ATTENDANCE_STATUS_BG_COLORS[status]
    } as React.CSSProperties;

    return (
      <BaseButton
        ref={ref}
        variant={ATTENDANCE_STATUS_BUTTON_VARIANTS[status]}
        size={size}
        className={`seat-button ${className}`}
        style={buttonStyle}
        data-status={status}
        onClick={handleClick}
        onHover={handleHover}
        onFocus={handleFocus}
        disabled={disabled}
        {...props}
      >
        <span className="seat-student-name">{studentName}</span>
      </BaseButton>
    )
  }
)

SeatButton.displayName = 'SeatButton' 