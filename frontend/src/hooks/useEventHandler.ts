import { useState, useCallback } from 'react'

interface EventHandlers {
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onKeyUp?: (key: string) => void
  onDoubleClick?: () => void
}

interface UseEventHandlerReturn {
  isHovered: boolean
  isFocused: boolean
  isPressed: boolean
  handlers: {
    onClick: (e: React.MouseEvent) => void
    onMouseEnter: (e: React.MouseEvent) => void
    onMouseLeave: (e: React.MouseEvent) => void
    onFocus: (e: React.FocusEvent) => void
    onBlur: (e: React.FocusEvent) => void
    onKeyDown: (e: React.KeyboardEvent) => void
    onKeyUp: (e: React.KeyboardEvent) => void
    onDoubleClick: (e: React.MouseEvent) => void
  }
}

export function useEventHandler(eventHandlers: EventHandlers = {}): UseEventHandlerReturn {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

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

  const handleDoubleClick = useCallback((_e: React.MouseEvent) => {
    if (eventHandlers.onDoubleClick) {
      eventHandlers.onDoubleClick()
    }
  }, [eventHandlers.onDoubleClick])

  return {
    isHovered,
    isFocused,
    isPressed,
    handlers: {
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onDoubleClick: handleDoubleClick
    }
  }
} 