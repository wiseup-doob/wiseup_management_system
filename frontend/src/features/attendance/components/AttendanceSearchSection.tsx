import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import type { Student } from '@shared/types'
import './AttendanceSearchSection.css'

interface AttendanceSearchSectionProps {
  searchTerm: string
  students: Student[]
  isEditing: boolean
  isAddingMode: boolean // 추가
  onSearchChange: (value: string) => void
  onSearch: (value: string) => void
  onSelectSuggestion: (item: { id: string; label: string }) => void
  onAssignStudent: (studentId: string) => void
  onOpenStudentPanel: (student: Student) => void
  onToggleAddingMode: (mode: boolean) => void // 추가
}

export const AttendanceSearchSection = ({
  searchTerm,
  students,
  isEditing,
  isAddingMode, // 새로운 상태 추가
  onSearchChange,
  onAssignStudent,
  onOpenStudentPanel,
  onToggleAddingMode // 새로운 핸들러 추가
}: AttendanceSearchSectionProps) => {
  const handleSearch = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    
    const found = students.find(s => 
      s.name.replace(/\s+/g, '').includes(trimmed.replace(/\s+/g, ''))
    )
    
    if (found?.id) {
      if (isEditing || isAddingMode) {
        // 편집 모드 또는 추가 모드: 지정 배정 모드로 전환
        onAssignStudent(found.id as string)
        // 추가 모드 종료
        if (isAddingMode) {
          onToggleAddingMode(false)
        }
      } else {
        // 일반 모드: 학생 패널 오픈
        onOpenStudentPanel(found)
      }
    }
  }

  const handleSelectSuggestion = (item: { id: string; label: string }) => {
    const student = students.find(s => (s.id as any) === item.id)
    if (student) {
      if (isEditing || isAddingMode) {
        onAssignStudent(student.id as string)
        // 추가 모드 종료
        if (isAddingMode) {
          onToggleAddingMode(false)
        }
      } else {
        onOpenStudentPanel(student)
      }
    }
  }

  return (
    <BaseWidget className="search-section">
      <div className="search-section-content">
        <div className="search-section-left">
          <Label variant="heading" size="medium" className="section-title">
            자리배치도
          </Label>
        </div>
        <div className="search-section-right">
          {/* 좌석 추가 버튼 추가 */}
          <button
            className={`add-seat-button ${isAddingMode ? 'active' : ''}`}
            onClick={() => onToggleAddingMode(!isAddingMode)}
            title={isAddingMode ? '좌석 추가 모드 종료' : '좌석 추가 모드 시작'}
          >
            {isAddingMode ? '취소' : '➕ 좌석 추가'}
          </button>
          
          <SearchInput 
            placeholder={isAddingMode ? "학생 이름을 입력하고 엔터를 누르세요" : "원생을 검색하세요"}
            value={searchTerm}
            onChange={onSearchChange}
            onSearch={handleSearch}
            suggestions={students.map(s => ({ id: s.id as string, label: s.name }))}
            onSelectSuggestion={handleSelectSuggestion}
            variant="pill"
            showIcon={false}
            autoFocus={isAddingMode} // 추가 모드일 때 자동 포커스
          />
        </div>
      </div>
      
      {/* 추가 모드 안내 메시지 */}
      {isAddingMode && (
        <div className="adding-mode-info">
          <span className="info-icon">ℹ️</span>
          <span>좌석을 클릭한 후 학생 이름을 입력하세요</span>
        </div>
      )}
    </BaseWidget>
  )
}
