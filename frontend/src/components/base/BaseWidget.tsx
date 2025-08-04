import { forwardRef } from 'react'
import type { BaseWidgetProps } from '../../types/components'
import './BaseWidget.css'

export const BaseWidget = forwardRef<HTMLDivElement, BaseWidgetProps>(
  ({ 
    children, 
    className = '', 
    width,
    height,
    padding,
    margin,
    style,
    disabled = false,
    ...props 
  }, ref) => {
    
    const widgetStyle = {
      width,
      height,
      padding,
      margin,
      opacity: disabled ? 0.6 : 1,
      pointerEvents: disabled ? 'none' as const : 'auto' as const,
      ...style
    }
    
    const disabledClasses = disabled ? 'base-widget--disabled' : ''
    const combinedClasses = `base-widget ${disabledClasses} ${className}`.trim()
    
    return (
      <div
        ref={ref}
        className={combinedClasses}
        style={widgetStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

BaseWidget.displayName = 'BaseWidget' 