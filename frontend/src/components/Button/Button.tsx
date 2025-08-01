import Widget from '../Widget/Widget'
import './Button.css'

interface ButtonProps {
  children: React.ReactNode
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

function Button({
  children,
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
}: ButtonProps) {
  return (
    <Widget
      onClick={onClick}
      onHover={onHover}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      className={`button button--${variant} button--${size} ${className}`}
      tabIndex={tabIndex}
      role="button"
      {...props}
    >
      {children}
    </Widget>
  )
}

export default Button 