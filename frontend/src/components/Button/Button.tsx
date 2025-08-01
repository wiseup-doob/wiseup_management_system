import { useEventHandler } from '../../hooks/useEventHandler'
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
  tabIndex = 0
}: ButtonProps) {
  const { isHovered, isFocused, isPressed, handlers } = useEventHandler({
    onClick,
    onHover,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown,
    onDoubleClick
  })

  return (
    <button
      type={type}
      className={`button ${className}`}
      disabled={disabled}
      tabIndex={tabIndex}
      data-hovered={isHovered}
      data-focused={isFocused}
      data-pressed={isPressed}
      {...handlers}
    >
      {children}
    </button>
  )
}

export default Button 