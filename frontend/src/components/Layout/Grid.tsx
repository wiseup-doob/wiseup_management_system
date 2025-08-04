import { forwardRef } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import './Grid.css'

export interface GridProps extends BaseWidgetProps {
  columns: number
  rows?: number
  gap?: string | number
  templateColumns?: string
  templateRows?: string
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ 
    columns, 
    rows, 
    gap = '8px',
    templateColumns,
    templateRows,
    children,
    style,
    className = '',
    ...props 
  }, ref) => {
    
    const gapValue = typeof gap === 'number' ? `${gap}px` : gap
    
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: templateColumns || `repeat(${columns}, 1fr)`,
      gridTemplateRows: templateRows || (rows ? `repeat(${rows}, 1fr)` : 'auto'),
      gap: gapValue,
      ...style
    }
    
    return (
      <BaseWidget 
        ref={ref} 
        className={`grid ${className}`}
        style={gridStyle} 
        {...props}
      >
        {children}
      </BaseWidget>
    )
  }
)

Grid.displayName = 'Grid'
