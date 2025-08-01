import type { ReactNode } from 'react'
import './Layout.css'
import sidebarLogo from '../img/Sidebar_button_logo.png'
import { useAppContext } from '../contexts/AppContext'
import SidebarButton from '../components/Button/SidebarButton'
import AttendancePage from '../pages/AttendancePage'
import TimetablePage from '../pages/TimetablePage'
import StudentsPage from '../pages/StudentsPage'
import LearningPage from '../pages/LearningPage'
import GradesPage from '../pages/GradesPage'

interface LayoutProps {
  children: ReactNode
  title?: string
}

function Layout({ children, title = "WiseUp Management System" }: LayoutProps) {
  const { currentPage, setCurrentPage } = useAppContext()

  const menuItems = [
    { id: 'attendance', label: '출결 관리', icon: sidebarLogo },
    { id: 'timetable', label: '시간표 관리', icon: sidebarLogo },
    { id: 'students', label: '원생 관리', icon: sidebarLogo },
    { id: 'learning', label: '학습데이터 관리', icon: sidebarLogo },
    { id: 'grades', label: '성적 분석 시스템', icon: sidebarLogo }
  ]

  // 현재 페이지에 따른 컴포넌트 렌더링
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'attendance':
        return <AttendancePage />
      case 'timetable':
        return <TimetablePage />
      case 'students':
        return <StudentsPage />
      case 'learning':
        return <LearningPage />
      case 'grades':
        return <GradesPage />
      default:
        return children // 기본적으로 children 렌더링
    }
  }

  const handleMenuClick = (itemId: string) => {
    setCurrentPage(itemId)
  }

  const handleMenuHover = (itemId: string) => {
    console.log(`메뉴 호버: ${itemId}`)
  }

  const handleMenuLeave = (itemId: string) => {
    console.log(`메뉴 이탈: ${itemId}`)
  }

  return (
    <div className="layout-container">
      {/* 사이드바 */}
      <div className="sidebar">
        {/* 로고 */}
        <div className="logo">
          {title}
        </div>
        {/* 계정 섹션 */}
        <div className="section">
          <div className="section-title">계정</div>
          <SidebarButton
            isActive={true}
            onClick={() => console.log('관리자 클릭')}
            onHover={() => console.log('관리자 호버')}
          >
            관리자
          </SidebarButton>
        </div>

        {/* 일반 메뉴 섹션 */}
        <div className="section">
          <div className="section-title">일반</div>
          {menuItems.map((item) => (
            <SidebarButton
              key={item.id}
              icon={item.icon}
              isActive={currentPage === item.id}
              onClick={() => handleMenuClick(item.id)}
              onHover={() => handleMenuHover(item.id)}
              onMouseLeave={() => handleMenuLeave(item.id)}
            >
              {item.label}
            </SidebarButton>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 조건부 렌더링 */}
      <div className="main-content">
        {renderCurrentPage()}
      </div>
    </div>
  )
}

export default Layout 