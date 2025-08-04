import { forwardRef } from 'react'
import { BaseButton } from '../base/BaseButton'
import type { BaseButtonProps } from '../../types/components'
import './Button.css'

export interface ButtonProps extends BaseButtonProps {
  loading?: boolean
  icon?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, icon, children, className = '', ...props }, ref) => {
    
    const content = (
      <>
        {icon && <span className="button-icon">{icon}</span>}
        {loading && <span className="button-loading">...</span>}
        {children}
      </>
    )
    
    return (
      <BaseButton 
        ref={ref} 
        className={`button ${className}`}
        {...props}
      >
        {content}
      </BaseButton>
    )
  }
)

Button.displayName = 'Button' 