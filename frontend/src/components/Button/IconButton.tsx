import Button from './Button'
import './IconButton.css'

interface IconButtonProps {
  icon: string
  alt?: string
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onDoubleClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  tabIndex?: number
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
}

function IconButton({
  icon,
  alt = 'icon',
  onClick,
  onHover,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onDoubleClick,
  disabled = false,
  className = '',
  type = 'button',
  tabIndex = 0,
  variant = 'primary',
  size = 'medium',
  ...props
}: IconButtonProps) {
  return (
    <Button
      onClick={onClick}
      onHover={onHover}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      className={`icon-button icon-button--${variant} icon-button--${size} ${className}`}
      type={type}
      tabIndex={tabIndex}
      variant={variant}
      size={size}
      {...props}
    >
      <img src={icon} alt={alt} className="icon-button__icon" />
    </Button>
  )
}

export default IconButton 