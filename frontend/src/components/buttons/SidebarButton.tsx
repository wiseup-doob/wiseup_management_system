import { forwardRef } from 'react'
import { BaseButton } from '../base/BaseButton'
import type { BaseButtonProps } from '../../types/components'
import './SidebarButton.css'

export interface SidebarButtonProps extends BaseButtonProps {
  icon?: string
  label?: string
  isActive?: boolean
}

export const SidebarButton = forwardRef<HTMLButtonElement, SidebarButtonProps>(
  ({ 
    icon,
    label,
    children,
    isActive = false,
    className = '',
    variant = 'ghost',
    size = 'medium',
    ...props 
  }, ref) => {
    
    const content = (
      <>
        {icon && (
          <img src={icon} alt="menu icon" className="sidebar-button__icon" />
        )}
        <span className="sidebar-button__label">
          {label || children}
        </span>
      </>
    )
    
    return (
      <BaseButton
        ref={ref}
        className={`sidebar-button ${isActive ? 'sidebar-button--active' : ''} ${className}`}
        variant={variant}
        size={size}
        data-active={isActive}
        {...props}
      >
        {content}
      </BaseButton>
    )
  }
)

SidebarButton.displayName = 'SidebarButton' 