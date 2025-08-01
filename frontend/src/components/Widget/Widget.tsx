import { useEventHandler } from '../../hooks/useEventHandler'
import './Widget.css'

interface WidgetProps {
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
  tabIndex?: number
  role?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

function Widget({
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
  tabIndex = 0,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: WidgetProps) {
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
    <div
      className={`widget ${className}`}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={disabled ? -1 : tabIndex}
      data-hovered={isHovered}
      data-focused={isFocused}
      data-pressed={isPressed}
      data-disabled={disabled}
      {...handlers}
      {...props}
    >
      {children}
    </div>
  )
}

export default Widget 