import Widget from '../Widget/Widget'
import './Label.css'

interface LabelProps {
  children: React.ReactNode
  htmlFor?: string
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onDoubleClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'heading' | 'caption' | 'error'
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

function Label({
  children,
  htmlFor,
  onClick,
  onHover,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onDoubleClick,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'medium',
  color = 'primary',
  ...props
}: LabelProps) {
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
      className={`label label--${variant} label--${size} label--${color} ${className}`}
      role="label"
      {...props}
    >
      {htmlFor && (
        <label htmlFor={htmlFor} className="label__text">
          {children}
        </label>
      )}
      {!htmlFor && (
        <span className="label__text">
          {children}
        </span>
      )}
    </Widget>
  )
}

export default Label 