import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface Seat {
  id: string
  studentName: string
  status: 'present' | 'absent' | 'unknown'
  row: number
  col: number
}

interface AppContextType {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  user: any
  setUser: (user: any) => void
  // 출결 관련 상태
  attendanceData: {
    seats: Seat[]
    searchTerm: string
  }
  setAttendanceData: React.Dispatch<React.SetStateAction<{ seats: Seat[], searchTerm: string }>>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  
  // 출결 관련 상태
  const [attendanceData, setAttendanceData] = useState<{
    seats: Seat[]
    searchTerm: string
  }>({
    seats: Array.from({ length: 40 }, (_, index) => ({
      id: `seat-${index + 1}`,
      studentName: `학생${index + 1}`,
      status: 'unknown' as const,
      row: Math.floor(index / 5) + 1,
      col: (index % 5) + 1
    })),
    searchTerm: ''
  })

  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    user,
    setUser,
    attendanceData,
    setAttendanceData
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
} 