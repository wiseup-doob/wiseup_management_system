import { forwardRef } from 'react'
import { BaseLabel } from '../base/BaseLabel'
import type { BaseLabelProps } from '../../types/components'
import './Label.css'

export interface LabelProps extends BaseLabelProps {
  // Label만의 추가 props
}

export const Label = forwardRef<HTMLDivElement, LabelProps>(
  ({ 
    children, 
    className = '',
    ...props 
  }, ref) => {
    
    return (
      <BaseLabel 
        ref={ref} 
        className={`label ${className}`}
        {...props}
      >
        {children}
      </BaseLabel>
    )
  }
)

Label.displayName = 'Label' 