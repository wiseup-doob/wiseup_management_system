import { forwardRef } from 'react'
import { BaseLabel } from '../base/BaseLabel'
import type { BaseLabelProps } from '../../types/components'
import { Label } from './Label'
import './StatusLabels.css'

export interface StatusLabelsProps extends BaseLabelProps {
  // StatusLabels만의 추가 props
}

const statusConfig = [
  { label: '자리_등원', color: 'success' as const, bgColor: '#c8e6c9' },
  { label: '자리_미...', color: 'secondary' as const, bgColor: '#ffffff' },
  { label: '자리_결석', color: 'error' as const, bgColor: '#ffcdd2' }
]

export const StatusLabels = forwardRef<HTMLDivElement, StatusLabelsProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <BaseLabel 
        ref={ref}
        className={`status-labels ${className}`}
        {...props}
      >
        {statusConfig.map((status) => (
          <div key={status.color} className="status-item">
            <div 
              className="status-color"
              style={{ backgroundColor: status.bgColor }}
            />
            <Label className={`status-label status-label--${status.color}`}>
              {status.label}
            </Label>
          </div>
        ))}
      </BaseLabel>
    )
  }
)

StatusLabels.displayName = 'StatusLabels'
