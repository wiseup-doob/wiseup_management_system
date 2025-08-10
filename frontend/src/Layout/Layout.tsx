import type { ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './Layout.css'
import { Sidebar } from '../components/Layout/Sidebar'
import { MainContent } from '../components/Layout/MainContent'
import { ROUTES } from '../routes/paths'
import { SIDEBAR_MENU_ITEMS, ADMIN_MENU_ITEM } from '../config/menuConfig'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  console.log('Layout 렌더링됨, 현재 경로:', location.pathname)

  const handleMenuClick = (path: string) => {
    console.log('메뉴 클릭:', path)
    navigate(path)
  }

  const handleAdminClick = () => {
    console.log('관리자 클릭 - 홈으로 이동')
    navigate(ROUTES.HOME)
  }

  const handleMenuHover = (itemId: string) => {
    console.log(`메뉴 호버: ${itemId}`)
  }

  const handleMenuLeave = (itemId: string) => {
    console.log(`메뉴 이탈: ${itemId}`)
  }

  // 현재 경로에 따른 활성 상태 확인
  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return location.pathname === ROUTES.HOME
    }
    return location.pathname === path
  }

  return (
    <div className="layout-container">
      {/* Sidebar 컴포넌트 재사용 */}
      <Sidebar />

      {/* MainContent 컴포넌트 재사용 */}
      <MainContent>
        <Outlet />
      </MainContent>
    </div>
  )
}

export default Layout 