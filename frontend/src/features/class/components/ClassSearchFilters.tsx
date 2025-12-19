import React from 'react'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { Button } from '../../../components/buttons/Button'
import type { ClassViewMode } from '../types/class.types'

interface ClassSearchFiltersProps {
  searchValue: string
  onSearch: (value: string) => void
  viewMode: ClassViewMode
  onViewModeChange: (mode: ClassViewMode) => void
  filters: {
    teacherName: string
  }
  onFilter: (key: 'teacherName', value: string) => void
  uniqueTeachers: Array<{ id: string, name: string }>
  onAddNewClass: () => void
  onClear: () => void
}

export function ClassSearchFilters({
  searchValue,
  onSearch,
  viewMode,
  onViewModeChange,
  filters,
  onFilter,
  uniqueTeachers,
  onAddNewClass,
  onClear
}: ClassSearchFiltersProps) {
  return (
    <div className="search-filter-section">
      <div className="search-container" style={{ display: 'flex', alignItems: 'center', gap: '120px' }}>
        <SearchInput
          placeholder="수업명, 과목(국어/영어...), 선생님"
          value={searchValue}
          onChange={onSearch}
          onSearch={onSearch}
          variant="pill"
          showIcon={true}
          size="md"
          containerStyle={{ flex: 1 }}
        />
        <Button
          onClick={onClear}
          variant="secondary"
          className="clear-search-btn"
          disabled={!searchValue && !filters.teacherName}
          style={{
            backgroundColor: 'white',
            borderColor: '#ced4da',
            color: (!searchValue && !filters.teacherName) ? '#dee2e6' : '#333',
            fontSize: '0.9rem',
            fontWeight: 500,
            padding: '8px 16px',
            height: '36px',
            flexShrink: 0,
            marginTop: '-2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          초기화 ✕
        </Button>
      </div>

      <div className="filter-buttons">
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value as ClassViewMode)}
          className="filter-select"
          style={{ marginRight: '10px' }}
        >
          <option value="list">수업 목록</option>
          <option value="management">전체 수업 관리</option>
        </select>

        {viewMode === 'list' && (
          <select
            value={filters.teacherName}
            onChange={(e) => onFilter('teacherName', e.target.value)}
            className="filter-select"
          >
            <option value="">전체 선생님</option>
            {uniqueTeachers.map(teacher => (
              <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
            ))}
          </select>
        )}

        {viewMode === 'list' && (
          <Button
            onClick={onAddNewClass}
            className="add-class-btn"
            variant="primary"
          >
            수업 추가
          </Button>
        )}
      </div>
    </div >
  )
}