import { useEventHandler } from '../../hooks/useEventHandler'
import './Widget.css'

interface WidgetProps {
  children: React.ReactNode
  // 마우스 이벤트
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onDoubleClick?: () => void
  onMouseDown?: () => void
  onMouseUp?: () => void
  onMouseMove?: () => void
  onMouseOver?: () => void
  onMouseOut?: () => void
  onContextMenu?: () => void
  onWheel?: () => void
  
  // 키보드 이벤트
  onKeyDown?: (key: string) => void
  onKeyUp?: (key: string) => void
  
  // 포커스 이벤트
  onFocus?: () => void
  onBlur?: () => void
  
  // 드래그 이벤트
  onDragStart?: () => void
  onDrag?: () => void
  onDragEnd?: () => void
  onDragEnter?: () => void
  onDragLeave?: () => void
  onDrop?: () => void
  
  // 터치 이벤트
  onTouchStart?: () => void
  onTouchMove?: () => void
  onTouchEnd?: () => void
  
  // 기타 속성
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  tabIndex?: number
  role?: string
  'aria-label'?: string
  'aria-describedby'?: string
  draggable?: boolean
}

function Widget({
  children,
  // 마우스 이벤트
  onClick,
  onHover,
  onMouseLeave,
  onDoubleClick,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onMouseOver,
  onMouseOut,
  onContextMenu,
  onWheel,
  
  // 키보드 이벤트
  onKeyDown,
  onKeyUp,
  
  // 포커스 이벤트
  onFocus,
  onBlur,
  
  // 드래그 이벤트
  onDragStart,
  onDrag,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
  
  // 터치 이벤트
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  
  // 기타 속성
  disabled = false,
  className = '',
  style,
  tabIndex = 0,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  draggable,
  ...props
}: WidgetProps) {
  const { isHovered, isFocused, isPressed, handlers } = useEventHandler({
    onClick,
    onHover,
    onMouseLeave,
    onDoubleClick,
    onKeyDown,
    onKeyUp,
    onFocus,
    onBlur
  })

  return (
    <div
      className={`widget ${className}`}
      style={style}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={disabled ? -1 : tabIndex}
      data-hovered={isHovered}
      data-focused={isFocused}
      data-pressed={isPressed}
      data-disabled={disabled}
      draggable={draggable}
      {...handlers}
      {...props}
    >
      {children}
    </div>
  )
}

export default Widget 