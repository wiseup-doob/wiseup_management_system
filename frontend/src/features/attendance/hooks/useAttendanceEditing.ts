import { useState, useCallback } from 'react'
import type { Student } from '@shared/types'
import type { EditingMode } from '../types/attendance.types'

interface UseAttendanceEditingReturn {
  editingMode: EditingMode
  isEditing: boolean
  sourceSeatId: string | null
  assigningStudentId: string | null
  selectedStudent: Student | null
  isStudentPanelOpen: boolean
  startEditing: () => void
  stopEditing: () => void
  setAssigningStudentId: (id: string | null) => void
  setSelectedStudent: (student: Student | null) => void
  setIsStudentPanelOpen: (open: boolean) => void
  handleSeatClick: (seatId: string) => void
}

export const useAttendanceEditing = (): UseAttendanceEditingReturn => {
  const [editingMode, setEditingMode] = useState<EditingMode>('none')
  const [isEditing, setIsEditing] = useState(false)
  const [sourceSeatId, setSourceSeatId] = useState<string | null>(null)
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false)

  const startEditing = useCallback(() => {
    setIsEditing(true)
    setEditingMode('none')
    setSourceSeatId(null)
    setAssigningStudentId(null)
  }, [])

  const stopEditing = useCallback(() => {
    setIsEditing(false)
    setEditingMode('none')
    setSourceSeatId(null)
    setAssigningStudentId(null)
    setAssigningStudentId(null)
  }, [])

  const setAssigningStudentIdCallback = useCallback((id: string | null) => {
    setAssigningStudentId(id)
  }, [])

  const setSelectedStudentCallback = useCallback((student: Student | null) => {
    setSelectedStudent(student)
  }, [])

  const setIsStudentPanelOpenCallback = useCallback((open: boolean) => {
    setIsStudentPanelOpen(open)
  }, [])

  const handleSeatClick = useCallback((seatId: string) => {
    if (!isEditing) return

    if (editingMode === 'none') {
      // 편집 모드 시작 - 첫 번째 좌석 선택
      setSourceSeatId(seatId)
      setAssigningStudentId(null)
    } else if (editingMode === 'remove') {
      // 제거 모드 - 좌석 클릭 시 학생 제거
      setSourceSeatId(null)
      setAssigningStudentId(null)
    } else if (editingMode === 'move') {
      // 이동 모드 - 두 번째 좌석 선택 시 교환
      if (sourceSeatId && sourceSeatId !== seatId) {
        setSourceSeatId(null)
        setAssigningStudentId(null)
      } else {
        setSourceSeatId(seatId)
        setAssigningStudentId(null)
      }
    }
  }, [isEditing, editingMode, sourceSeatId])

  return {
    editingMode,
    isEditing,
    sourceSeatId,
    assigningStudentId,
    selectedStudent,
    isStudentPanelOpen,
    startEditing,
    stopEditing,
    setAssigningStudentId: setAssigningStudentIdCallback,
    setSelectedStudent: setSelectedStudentCallback,
    setIsStudentPanelOpen: setIsStudentPanelOpenCallback,
    handleSeatClick
  }
}
