import Widget from '../Widget/Widget'
import './Grid.css'

interface GridProps {
  children: React.ReactNode
  columns?: number
  rows?: number
  gap?: string
  className?: string
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onDoubleClick?: () => void
  disabled?: boolean
}

function Grid({
  children,
  columns = 1,
  rows,
  gap = '10px',
  className = '',
  onClick,
  onHover,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onDoubleClick,
  disabled = false,
  ...props
}: GridProps) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : 'auto',
    gap: gap,
  }

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
      className={`grid ${className}`}
      style={gridStyle}
      {...props}
    >
      {children}
    </Widget>
  )
}

export default Grid
