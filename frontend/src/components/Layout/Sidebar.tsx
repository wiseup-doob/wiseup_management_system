import { forwardRef } from 'react'
import { BaseWidget } from '../base/BaseWidget'
import type { BaseWidgetProps } from '../../types/components'
import { SidebarButton } from '../buttons/SidebarButton'
import { Label } from '../labels/Label'
import './Sidebar.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { SIDEBAR_MENU_ITEMS, ADMIN_MENU_ITEM } from '../../config/menuConfig'
import { useAppSelector } from '../../hooks/useAppSelector'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { toggleSidebar } from '../../store/slices/uiSlice'

export interface SidebarProps extends BaseWidgetProps {
  // Sidebar만의 추가 props
}

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

    return (
      <BaseWidget 
        ref={ref}
        className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''} ${className}`}
        {...props}
      >
        {/* 로고 섹션 */}
        <div className="sidebar-logo">
          <div className="logo-placeholder">로고</div>
        </div>

        {/* 계정 섹션 */}
        <div className="sidebar-section">
          <h3 className="section-title">계정</h3>
          
          {/* 현재 계정 정보 */}
          <div className="account-info">
            <div className="account-display">
              <span className="account-name">관리자</span>
              <span className="account-email">xxx@gmail.com</span>
              <button className="account-dropdown">▼</button>
            </div>
          </div>
          
          {/* 계정 액션 버튼들 */}
          <div className="account-actions">
            <button className="account-action-btn">계정 추가</button>
            <button className="account-action-btn">로그아웃</button>
          </div>
          
          {/* 추가 관리자 계정들 */}
          <div className="additional-accounts">
            <div className="account-item">
              <span className="account-name">관리자2</span>
              <span className="account-email">xxx@gmail.com</span>
            </div>
            <div className="account-item">
              <span className="account-name">관리자2</span>
              <span className="account-email">xxx@gmail.com</span>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="sidebar-divider"></div>

        {/* 일반 메뉴 섹션 */}
        <div className="sidebar-section">
          <h3 className="section-title">일반</h3>
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

        {/* 관리자 메뉴 섹션 */}
        <div className="sidebar-section">
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              <li className="sidebar-menu-item">
                <SidebarButton
                  icon={ADMIN_MENU_ITEM.icon}
                  label={ADMIN_MENU_ITEM.label}
                  isActive={location.pathname === ADMIN_MENU_ITEM.path}
                  onClick={() => handleMenuClick(ADMIN_MENU_ITEM.path)}
                />
              </li>
            </ul>
          </nav>
        </div>
      </BaseWidget>
    )
  }
)

Sidebar.displayName = 'Sidebar' 