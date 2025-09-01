import React from 'react'
import { Label } from '../../../components/labels/Label'
import { Button } from '../../../components/buttons/Button'
import type { ClassSectionWithDetails } from '../types/class.types'

interface ClassListProps {
  isLoading: boolean
  error: string | null
  filteredClasses: ClassSectionWithDetails[] | null
  currentClasses: ClassSectionWithDetails[]
  selectedClass: ClassSectionWithDetails | null
  searchValue: string
  filters: { teacherName: string }
  onSelectClass: (classItem: ClassSectionWithDetails) => void
  onEditClass: (classItem: ClassSectionWithDetails) => void
  onDeleteClass: (classItem: ClassSectionWithDetails) => void
  onOpenAddStudentModal: (classItem: ClassSectionWithDetails) => void
  onAddNewClass: () => void
  onRefreshClasses: () => void
  onClearSearch: () => void
  highlightText: (text: string, searchTerm: string) => string
  renderSkeleton: () => React.ReactElement
  renderPagination: () => React.ReactElement | null
}

export function ClassList({
  isLoading,
  error,
  filteredClasses,
  currentClasses,
  selectedClass,
  searchValue,
  filters,
  onSelectClass,
  onEditClass,
  onDeleteClass,
  onOpenAddStudentModal,
  onAddNewClass,
  onRefreshClasses,
  onClearSearch,
  highlightText,
  renderSkeleton,
  renderPagination
}: ClassListProps) {
  // 에러 상태 UI
  const renderError = () => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-message">
        <h3>데이터를 불러오는 중 오류가 발생했습니다</h3>
        <p>{error}</p>
        <Button 
          onClick={onRefreshClasses}
          variant="primary"
          className="retry-button"
        >
          다시 시도
        </Button>
      </div>
    </div>
  )

  // 빈 데이터 상태 UI
  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📚</div>
      <div className="empty-message">
        <h3>등록된 수업이 없습니다</h3>
        <p>새로운 수업을 추가해보세요!</p>
        <Button 
          onClick={onAddNewClass}
          variant="primary"
          className="add-first-class-btn"
        >
          첫 수업 추가하기
        </Button>
      </div>
    </div>
  )

  return (
    <div className="class-panel">
      <div className="panel-section">
        <Label variant="heading" size="medium" className="section-title">
          수업 목록
        </Label>
        <div className="class-list">
          {isLoading ? (
            renderSkeleton()
          ) : error ? (
            renderError()
          ) : !filteredClasses || filteredClasses.length === 0 ? (
            searchValue || Object.values(filters).some(f => f) ? (
              <div className="empty-message">
                <Label variant="secondary" size="small">
                  검색 결과가 없습니다.
                </Label>
                <Button 
                  onClick={onClearSearch}
                  variant="secondary"
                  className="clear-search-btn"
                >
                  검색 초기화
                </Button>
              </div>
            ) : (
              renderEmptyState()
            )
          ) : isLoading ? (
            renderSkeleton()
          ) : (
            currentClasses && currentClasses.map((classItem) => (
              <div 
                key={classItem.id} 
                className={`class-item ${selectedClass?.id === classItem.id ? 'selected' : ''}`}
                onClick={() => onSelectClass(classItem)}
              >
                <div className="class-item-header">
                  <div 
                    className="class-item-name"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(classItem.name, searchValue) 
                    }}
                  />
                  <span className={`class-status ${classItem.status}`}>
                    {classItem.status === 'active' ? '활성' : 
                     classItem.status === 'inactive' ? '비활성' : '완료'}
                  </span>
                </div>
                <div className="class-item-details">
                  <div className="detail-row">
                    <span className="detail-label">과목:</span>
                    <span className="detail-value">
                      {classItem.course?.name || '미정'} ({classItem.course?.subject || '미정'})
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">선생님:</span>
                    <span className="detail-value"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightText(classItem.teacher?.name || classItem.teacherId, searchValue) 
                      }}
                    />
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">학생 수:</span>
                    <span className="detail-value">{classItem.currentStudents}/{classItem.maxStudents}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">강의실:</span>
                    <span className="detail-value">
                      {classItem.classroom?.name || classItem.classroomId}
                    </span>
                  </div>
                </div>
                <div className="class-item-actions">
                  <Button 
                    onClick={() => onEditClass(classItem)}
                    variant="secondary"
                    size="small"
                    className="edit-btn"
                  >
                    편집
                  </Button>
                  <Button 
                    onClick={() => onOpenAddStudentModal(classItem)}
                    variant="primary"
                    size="small"
                    className="add-student-btn"
                  >
                    학생 추가
                  </Button>
                  <Button 
                    onClick={() => onDeleteClass(classItem)}
                    variant="danger"
                    size="small"
                    className="delete-btn"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {/* 페이지네이션 */}
          {renderPagination()}
        </div>
      </div>
    </div>
  )
}