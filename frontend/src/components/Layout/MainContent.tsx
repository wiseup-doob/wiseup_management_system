import { forwardRef } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import './MainContent.css'

export type MainContentProps = BaseWidgetProps

export const MainContent = forwardRef<HTMLDivElement, MainContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <BaseWidget 
        ref={ref}
        className={`main-content ${className}`}
        {...props}
      >
        {children}
      </BaseWidget>
    )
  }
)

MainContent.displayName = 'MainContent' 