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
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  type?: 'button' | 'submit' | 'reset'
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
  size = 'medium',
  variant = 'primary',
  className = '',
  type = 'button'
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
      type={type}
      className={`icon-button icon-button--${variant} icon-button--${size} ${className}`}
    >
      <img src={icon} alt={alt} className="icon-button__icon" />
    </Button>
  )
}

export default IconButton 