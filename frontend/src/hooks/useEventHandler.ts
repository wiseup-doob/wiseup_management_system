import { useState, useCallback } from 'react'

interface EventHandlers {
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
}

interface UseEventHandlerReturn {
  isHovered: boolean
  isFocused: boolean
  isPressed: boolean
  isDragging: boolean
  handlers: {
    // 마우스 이벤트
    onClick: (e: React.MouseEvent) => void
    onMouseEnter: (e: React.MouseEvent) => void
    onMouseLeave: (e: React.MouseEvent) => void
    onDoubleClick: (e: React.MouseEvent) => void
    onMouseDown: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseOver: (e: React.MouseEvent) => void
    onMouseOut: (e: React.MouseEvent) => void
    onContextMenu: (e: React.MouseEvent) => void
    onWheel: (e: React.WheelEvent) => void
    
    // 키보드 이벤트
    onKeyDown: (e: React.KeyboardEvent) => void
    onKeyUp: (e: React.KeyboardEvent) => void
    
    // 포커스 이벤트
    onFocus: (e: React.FocusEvent) => void
    onBlur: (e: React.FocusEvent) => void
    
    // 드래그 이벤트
    onDragStart: (e: React.DragEvent) => void
    onDrag: (e: React.DragEvent) => void
    onDragEnd: (e: React.DragEvent) => void
    onDragEnter: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    
    // 터치 이벤트
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
}

export function useEventHandler(eventHandlers: EventHandlers = {}): UseEventHandlerReturn {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // 마우스 이벤트 핸들러들
  const handleClick = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onClick) {
      eventHandlers.onClick()
    }
  }, [eventHandlers.onClick])

  const handleMouseEnter = useCallback((_e: React.MouseEvent) => {
    setIsHovered(true)
    if (eventHandlers.onHover) {
      eventHandlers.onHover()
    }
  }, [eventHandlers.onHover])

  const handleMouseLeave = useCallback((_e: React.MouseEvent) => {
    setIsHovered(false)
    if (eventHandlers.onMouseLeave) {
      eventHandlers.onMouseLeave()
    }
  }, [eventHandlers.onMouseLeave])

  const handleDoubleClick = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onDoubleClick) {
      eventHandlers.onDoubleClick()
    }
  }, [eventHandlers.onDoubleClick])

  const handleMouseDown = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onMouseDown) {
      eventHandlers.onMouseDown()
    }
  }, [eventHandlers.onMouseDown])

  const handleMouseUp = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onMouseUp) {
      eventHandlers.onMouseUp()
    }
  }, [eventHandlers.onMouseUp])

  const handleMouseMove = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onMouseMove) {
      eventHandlers.onMouseMove()
    }
  }, [eventHandlers.onMouseMove])

  const handleMouseOver = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onMouseOver) {
      eventHandlers.onMouseOver()
    }
  }, [eventHandlers.onMouseOver])

  const handleMouseOut = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onMouseOut) {
      eventHandlers.onMouseOut()
    }
  }, [eventHandlers.onMouseOut])

  const handleContextMenu = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onContextMenu) {
      eventHandlers.onContextMenu()
    }
  }, [eventHandlers.onContextMenu])

  const handleWheel = useCallback((_e: React.WheelEvent) => {
    if (eventHandlers.onWheel) {
      eventHandlers.onWheel()
    }
  }, [eventHandlers.onWheel])

  // 키보드 이벤트 핸들러들
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(true)
    }
    if (eventHandlers.onKeyDown) {
      eventHandlers.onKeyDown(e.key)
    }
  }, [eventHandlers.onKeyDown])

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false)
    }
    if (eventHandlers.onKeyUp) {
      eventHandlers.onKeyUp(e.key)
    }
  }, [eventHandlers.onKeyUp])

  // 포커스 이벤트 핸들러들
  const handleFocus = useCallback((_e: React.FocusEvent) => {
    setIsFocused(true)
    if (eventHandlers.onFocus) {
      eventHandlers.onFocus()
    }
  }, [eventHandlers.onFocus])

  const handleBlur = useCallback((_e: React.FocusEvent) => {
    setIsFocused(false)
    if (eventHandlers.onBlur) {
      eventHandlers.onBlur()
    }
  }, [eventHandlers.onBlur])

  // 드래그 이벤트 핸들러들
  const handleDragStart = useCallback((_e: React.DragEvent) => {
    setIsDragging(true)
    if (eventHandlers.onDragStart) {
      eventHandlers.onDragStart()
    }
  }, [eventHandlers.onDragStart])

  const handleDrag = useCallback((_e: React.DragEvent) => {
    if (eventHandlers.onDrag) {
      eventHandlers.onDrag()
    }
  }, [eventHandlers.onDrag])

  const handleDragEnd = useCallback((_e: React.DragEvent) => {
    setIsDragging(false)
    if (eventHandlers.onDragEnd) {
      eventHandlers.onDragEnd()
    }
  }, [eventHandlers.onDragEnd])

  const handleDragEnter = useCallback((_e: React.DragEvent) => {
    if (eventHandlers.onDragEnter) {
      eventHandlers.onDragEnter()
    }
  }, [eventHandlers.onDragEnter])

  const handleDragLeave = useCallback((_e: React.DragEvent) => {
    if (eventHandlers.onDragLeave) {
      eventHandlers.onDragLeave()
    }
  }, [eventHandlers.onDragLeave])

  const handleDrop = useCallback((_e: React.DragEvent) => {
    if (eventHandlers.onDrop) {
      eventHandlers.onDrop()
    }
  }, [eventHandlers.onDrop])

  // 터치 이벤트 핸들러들
  const handleTouchStart = useCallback((_e: React.TouchEvent) => {
    if (eventHandlers.onTouchStart) {
      eventHandlers.onTouchStart()
    }
  }, [eventHandlers.onTouchStart])

  const handleTouchMove = useCallback((_e: React.TouchEvent) => {
    if (eventHandlers.onTouchMove) {
      eventHandlers.onTouchMove()
    }
  }, [eventHandlers.onTouchMove])

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    if (eventHandlers.onTouchEnd) {
      eventHandlers.onTouchEnd()
    }
  }, [eventHandlers.onTouchEnd])

  return {
    isHovered,
    isFocused,
    isPressed,
    isDragging,
    handlers: {
      // 마우스 이벤트
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onDoubleClick: handleDoubleClick,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseMove: handleMouseMove,
      onMouseOver: handleMouseOver,
      onMouseOut: handleMouseOut,
      onContextMenu: handleContextMenu,
      onWheel: handleWheel,
      
      // 키보드 이벤트
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      
      // 포커스 이벤트
      onFocus: handleFocus,
      onBlur: handleBlur,
      
      // 드래그 이벤트
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      
      // 터치 이벤트
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
} 