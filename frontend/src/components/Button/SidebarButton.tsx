import Button from './Button'
import './SidebarButton.css'

interface SidebarButtonProps {
  children: React.ReactNode
  icon?: string
  isActive?: boolean
  onClick?: () => void
  onHover?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
  onKeyDown?: (key: string) => void
  onDoubleClick?: () => void
  disabled?: boolean
  className?: string
}

function SidebarButton({
  children,
  icon,
  isActive = false,
  onClick,
  onHover,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onDoubleClick,
  disabled = false,
  className = ''
}: SidebarButtonProps) {
  return (
    <Button
      onClick={onClick}
      onHover={onHover}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onDoubleClick={onDoubleClick}
      disabled={disabled}
      className={`sidebar-button ${isActive ? 'sidebar-button--active' : ''} ${className}`}
      data-active={isActive}
    >
      {icon && (
        <img src={icon} alt="menu icon" className="sidebar-button__icon" />
      )}
      <span className="sidebar-button__label">{children}</span>
    </Button>
  )
}

export default SidebarButton 