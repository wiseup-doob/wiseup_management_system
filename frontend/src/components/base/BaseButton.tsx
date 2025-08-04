import { forwardRef } from 'react'
import type { BaseButtonProps } from '../../types/components'
import './BaseButton.css'

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ 
    children, 
    className = '', 
    variant = 'primary',
    size = 'medium',
    onClick,
    onHover,
    onFocus,
    onBlur,
    disabled = false,
    type = 'button',
    style,
    ...props 
  }, ref) => {
    
    const baseClasses = 'base-button'
    const variantClasses = `base-button--${variant}`
    const sizeClasses = `base-button--${size}`
    const disabledClasses = disabled ? 'base-button--disabled' : ''
    
    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim()
    
    return (
      <button
        ref={ref}
        className={combinedClasses}
        onClick={onClick}
        onMouseEnter={onHover}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        type={type}
        style={style}
        {...props}
      >
        {children}
      </button>
    )
  }
)

BaseButton.displayName = 'BaseButton' 