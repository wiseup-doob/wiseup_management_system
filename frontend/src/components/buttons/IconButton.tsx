import { forwardRef } from 'react'
import { BaseButton } from '../base/BaseButton'
import type { BaseButtonProps } from '../../types/components'
import './IconButton.css'

export interface IconButtonProps extends BaseButtonProps {
  icon: string
  alt?: string
  iconSize?: number
  iconPosition?: 'left' | 'right'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    icon, 
    alt = 'icon',
    iconSize = 16, 
    iconPosition = 'left',
    children,
    className = '',
    variant = 'primary',
    size = 'medium',
    ...props 
  }, ref) => {
    
    const iconElement = (
      <img 
        src={icon} 
        alt={alt} 
        className="icon-button__icon"
        style={{ fontSize: iconSize }}
      />
    )
    
    const content = iconPosition === 'left' 
      ? <>{iconElement}{children}</>
      : <>{children}{iconElement}</>
    
    return (
      <BaseButton 
        ref={ref} 
        className={`icon-button ${className}`}
        variant={variant}
        size={size}
        {...props}
      >
        {content}
      </BaseButton>
    )
  }
)

IconButton.displayName = 'IconButton' 