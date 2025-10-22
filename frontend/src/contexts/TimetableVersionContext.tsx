import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { TimetableVersion } from '../features/schedule/types/timetable-version.types'
import { apiService } from '../services/api'
import { message } from 'antd'

interface TimetableVersionContextType {
  versions: TimetableVersion[]
  selectedVersion: TimetableVersion | null
  activeVersion: TimetableVersion | null
  loading: boolean
  setSelectedVersion: (version: TimetableVersion | null) => void
  loadVersions: () => Promise<void>
  activateVersion: (versionId: string) => Promise<void>
}

const TimetableVersionContext = createContext<TimetableVersionContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useTimetableVersion() {
  const context = useContext(TimetableVersionContext)
  if (context === undefined) {
    throw new Error('useTimetableVersion must be used within a TimetableVersionProvider')
  }
  return context
}

interface TimetableVersionProviderProps {
  children: ReactNode
}

export function TimetableVersionProvider({ children }: TimetableVersionProviderProps) {
  const [versions, setVersions] = useState<TimetableVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<TimetableVersion | null>(null)
  const [activeVersion, setActiveVersion] = useState<TimetableVersion | null>(null)
  const [loading, setLoading] = useState(true)

  // 버전 목록 로드
  const loadVersions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTimetableVersions()

      if (response.success && response.data) {
        setVersions(response.data)

        // 활성 버전 찾기
        const active = response.data.find(v => v.isActive)
        setActiveVersion(active || null)

        // 선택된 버전이 없으면 활성 버전으로 설정
        if (!selectedVersion && active) {
          setSelectedVersion(active)
        }
      }
    } catch (error) {
      console.error('Failed to load timetable versions:', error)
      message.error('시간표 버전 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 버전 활성화
  const activateVersion = async (versionId: string) => {
    try {
      await apiService.activateTimetableVersion(versionId)

      // 목록 새로고침
      const response = await apiService.getTimetableVersions()
      if (response.success && response.data) {
        setVersions(response.data)

        // 새로 활성화된 버전을 찾아서 선택
        const newActiveVersion = response.data.find(v => v.isActive)
        setActiveVersion(newActiveVersion || null)

        // 자동으로 새 활성 버전 선택
        if (newActiveVersion) {
          setSelectedVersion(newActiveVersion)
        }
      }
    } catch (error) {
      console.error('Failed to activate version:', error)
      throw error
    }
  }

  // 초기 로드
  useEffect(() => {
    loadVersions()
  }, [])

  const value: TimetableVersionContextType = {
    versions,
    selectedVersion,
    activeVersion,
    loading,
    setSelectedVersion,
    loadVersions,
    activateVersion
  }

  return (
    <TimetableVersionContext.Provider value={value}>
      {children}
    </TimetableVersionContext.Provider>
  )
}
