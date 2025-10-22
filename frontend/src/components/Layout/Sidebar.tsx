import { forwardRef } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import { SidebarButton } from '../buttons/SidebarButton'
import { AccountButton } from '../buttons/AccountButton'
import { Label } from '../labels/Label'
import './Sidebar.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { SIDEBAR_MENU_ITEMS, ADMIN_MENU_ITEM } from '../../config/menuConfig'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { toggleSidebar } from '../../store/slices/uiSlice'
import WiseupLogo from '../../img/Wiseup_logo.png'

export type SidebarProps = BaseWidgetProps

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className = '', ...props }, ref) => {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { sidebarCollapsed } = useAppSelector((state: any) => state.ui)

    const handleMenuClick = (path: string) => {
      navigate(path)
    }

    const handleToggleSidebar = () => {
      dispatch(toggleSidebar())
    }

    const handleAccountClick = () => {
      // 계정 버튼 클릭 시 홈 화면으로 이동
      navigate('/')
    }

    return (
      <BaseWidget 
        ref={ref}
        className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''} ${className}`}
        {...props}
      >
        {/* 로고 섹션 */}
        <div className="sidebar-logo">
          <img 
            src={WiseupLogo} 
            alt="Wiseup Logo" 
            className="wiseup-logo"
          />
        </div>

        {/* 계정 섹션 */}
        <div className="sidebar-section">
          <h5 className="section-title">계정</h5>
          
          {/* AccountButton 사용 */}
          <AccountButton
            accountName="관리자"
            accountEmail="xxx@gmail.com"
            showEmail={true}
            onClick={handleAccountClick}
          />
        </div>

        {/* 일반 메뉴 섹션 */}
        <div className="sidebar-section">
          <h5 className="section-title">일반</h5>
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              {SIDEBAR_MENU_ITEMS.map((item) => (
                <li key={item.path} className="sidebar-menu-item">
                  <SidebarButton
                    icon={item.icon}
                    label={item.label}
                    isActive={location.pathname === item.path}
                    onClick={() => handleMenuClick(item.path)}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </BaseWidget>
    )
  }
)

Sidebar.displayName = 'Sidebar' 