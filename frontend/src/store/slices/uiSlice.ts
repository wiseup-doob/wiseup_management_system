import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarCollapsed: boolean
  currentPage: string
  theme: 'light' | 'dark'
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    timestamp: number
  }>
}

const initialState: UIState = {
  sidebarCollapsed: false,
  currentPage: 'home',
  theme: 'light',
  notifications: []
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 사이드바 토글
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    
    // 사이드바 상태 설정
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    
    // 현재 페이지 설정
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    
    // 테마 변경
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    
    // 알림 추가
    addNotification: (state, action: PayloadAction<{
      message: string
      type: 'success' | 'error' | 'warning' | 'info'
    }>) => {
      const notification = {
        id: Date.now().toString(),
        message: action.payload.message,
        type: action.payload.type,
        timestamp: Date.now()
      }
      state.notifications.push(notification)
    },
    
    // 알림 제거
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    
    // 모든 알림 제거
    clearAllNotifications: (state) => {
      state.notifications = []
    }
  }
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setCurrentPage,
  setTheme,
  addNotification,
  removeNotification,
  clearAllNotifications
} = uiSlice.actions

export default uiSlice.reducer 