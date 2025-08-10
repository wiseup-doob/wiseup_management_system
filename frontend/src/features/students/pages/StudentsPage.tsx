import './StudentsPage.css'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Button } from '../../../components/buttons/Button'
import { Grid } from '../../../components/Layout/Grid'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { useStudents } from '../hooks/useStudents'
import type { BaseWidgetProps } from '../../../types/components'

function StudentsPage() {
  const { 
    students, 
    searchTerm, 
    filters, 
    handleSearchChange, 
    handleFilterChange 
  } = useStudents()

  return (
    <BaseWidget className="students-page">
      <Label 
        variant="heading" 
        size="large" 
        className="page-title"
      >
        학생 관리
      </Label>
    </BaseWidget>
  )
}

export default StudentsPage 