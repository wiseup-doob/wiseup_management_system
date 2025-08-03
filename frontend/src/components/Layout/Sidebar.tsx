import SidebarButton from '../Button/SidebarButton'
import Label from '../Label/Label'
import './Sidebar.css'

interface SidebarProps {
  title: string
  menuItems: Array<{
    id: string
    label: string
    path: string
    icon?: any
  }>
  adminMenuItem: {
    id: string
    label: string
    path: string
    icon?: any
  }
  isActive: (path: string) => boolean
  onMenuClick: (path: string) => void
  onAdminClick: () => void
  onMenuHover?: (itemId: string) => void
  onMenuLeave?: (itemId: string) => void
}

function Sidebar({
  title,
  menuItems,
  adminMenuItem,
  isActive,
  onMenuClick,
  onAdminClick,
  onMenuHover,
  onMenuLeave
}: SidebarProps) {
  return (
    <div className="sidebar">
      {/* 로고 */}
      <div className="logo">
        <Label variant="heading" size="large" color="primary">
          {title}
        </Label>
      </div>
      
      {/* 계정 섹션 */}
      <div className="section">
        <Label variant="caption" size="small" color="secondary" className="section-title">
          계정
        </Label>
        <SidebarButton
          isActive={isActive(adminMenuItem.path)}
          onClick={onAdminClick}
          onHover={() => onMenuHover?.('admin')}
        >
          {adminMenuItem.label}
        </SidebarButton>
      </div>

      {/* 일반 메뉴 섹션 */}
      <div className="section">
        <Label variant="caption" size="small" color="secondary" className="section-title">
          일반
        </Label>
        {menuItems.map((item) => (
          <SidebarButton
            key={item.id}
            icon={item.icon}
            isActive={isActive(item.path)}
            onClick={() => onMenuClick(item.path)}
            onHover={() => onMenuHover?.(item.id)}
            onMouseLeave={() => onMenuLeave?.(item.id)}
          >
            {item.label}
          </SidebarButton>
        ))}
      </div>
    </div>
  )
}

export default Sidebar 