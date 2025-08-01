import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AppContextType {
  currentPage: string
  setCurrentPage: (page: string) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  user: any
  setUser: (user: any) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [currentPage, setCurrentPage] = useState('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)

  const value = {
    currentPage,
    setCurrentPage,
    sidebarCollapsed,
    setSidebarCollapsed,
    user,
    setUser
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
} 