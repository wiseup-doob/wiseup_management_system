import { forwardRef } from 'react'
import { BaseWidget } from './BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import './BaseLabel.css'

export interface BaseLabelProps extends BaseWidgetProps {
  htmlFor?: string
  required?: boolean
  variant?: 'default' | 'heading' | 'caption' | 'error' | 'secondary' | 'success'
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export const BaseLabel = forwardRef<HTMLDivElement, BaseLabelProps>(
  ({ 
    children, 
    htmlFor,
    required = false,
    variant = 'default',
    size = 'medium',
    color = 'primary',
    className = '',
    ...props 
  }, ref) => {
    
    const content = (
      <>
        {children}
        {required && <span className="base-label__required">*</span>}
      </>
    )
    
    const variantClasses = `base-label--${variant}`
    const sizeClasses = `base-label--${size}`
    const colorClasses = `base-label--${color}`
    
    const combinedClasses = `base-label ${variantClasses} ${sizeClasses} ${colorClasses} ${className}`.trim()
    
    return (
      <BaseWidget 
        ref={ref} 
        className={combinedClasses}
        {...props}
      >
        <label htmlFor={htmlFor}>
          {content}
        </label>
      </BaseWidget>
    )
  }
)

BaseLabel.displayName = 'BaseLabel' 