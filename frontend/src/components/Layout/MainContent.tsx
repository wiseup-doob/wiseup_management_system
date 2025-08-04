import { forwardRef } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import './MainContent.css'

export interface MainContentProps extends BaseWidgetProps {
  // MainContent만의 추가 props
}

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