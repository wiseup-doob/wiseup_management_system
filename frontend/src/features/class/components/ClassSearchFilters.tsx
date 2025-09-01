import React from 'react'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { Button } from '../../../components/buttons/Button'

interface ClassSearchFiltersProps {
  searchValue: string
  onSearch: (value: string) => void
  filters: {
    teacherName: string
  }
  onFilter: (key: 'teacherName', value: string) => void
  uniqueTeachers: Array<{id: string, name: string}>
  onAddNewClass: () => void
}

export function ClassSearchFilters({
  searchValue,
  onSearch,
  filters,
  onFilter,
  uniqueTeachers,
  onAddNewClass
}: ClassSearchFiltersProps) {
  return (
    <div className="search-filter-section">
      <div className="search-container">
        <SearchInput 
          placeholder="수업명 또는 선생님 검색"
          value={searchValue}
          onChange={onSearch}
          onSearch={onSearch}
          variant="pill"
          showIcon={true}
          size="md"
        />
      </div>
      
      <div className="filter-buttons">
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
        
        <Button 
          onClick={onAddNewClass}
          className="add-class-btn"
          variant="primary"
        >
          수업 추가
        </Button>
      </div>
    </div>
  )
}