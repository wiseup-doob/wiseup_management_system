import './TimetablePage.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useStudentList } from '../hooks/useStudentList'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { TimeTable } from '../../../components/business/timetable/TimeTable'
import { useTimetable } from '../hooks/useTimetable'
import { useTimetableStats } from '../hooks/useTimetableStats'
import { useTimetableBlocks } from '../hooks/useTimetableBlocks'
import type { 
  TimetableItem, 
  TimeSlot, 
  DayOfWeek, 
  SubjectType, 
  ClassType,
  ClassStatus 
} from '@shared/types'
import type { TimetableBlock } from '@shared/types/timetable.types'

function TimetablePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const studentsList = useStudentList()
  const {
    timeSlots,
    timetableItems,
    isEditable,
    loading,
    error,
    selectedItem,
    loadTimetableData,
    loadStudentTimetableData,
    deleteItem,
    selectItem,
    toggleEdit
  } = useTimetable()

  const stats = useTimetableStats()
  const { blocks: apiBlocks, isLoading: blocksLoading, error: blocksError, hasData: hasApiData } = useTimetableBlocks()

  // 검색 입력값 상태 (고정 문자열로 전달되어 입력이 막히는 문제 해결)
  const [searchValue, setSearchValue] = useState('')

  // 시간표 아이템 클릭 핸들러
  const handleItemClick = (item: TimetableItem) => {
    console.log('시간표 아이템 클릭:', item)
    selectItem(item)
  }

  // 시간표 아이템 편집 핸들러
  const handleItemEdit = (item: TimetableItem) => {
    console.log('시간표 아이템 편집:', item)
    // TODO: 편집 모달 또는 페이지로 이동
  }

  // 시간표 아이템 삭제 핸들러
  const handleItemDelete = async (item: TimetableItem) => {
    console.log('시간표 아이템 삭제:', item)
    if (window.confirm('정말로 이 수업을 삭제하시겠습니까?')) {
      await deleteItem(item.id)
    }
  }

  // 셀 클릭 핸들러 (새 수업 추가)
  const handleCellClick = (day: DayOfWeek, timeSlot: TimeSlot) => {
    console.log('셀 클릭:', { day, timeSlot })
    if (isEditable) {
      // TODO: 새 수업 추가 모달 또는 페이지로 이동
      console.log('새 수업 추가 모달 열기')
    }
  }

  // 검색 핸들러
  const handleSearchChange = (value: string) => {
    console.log('검색어 변경:', value)
    // TODO: 검색 로직 구현
  }

  // 데이터 로드: 학생이 선택된 경우에만 로드 (초기에는 빈 화면)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const studentId = params.get('studentId')
    if (studentId) {
      loadStudentTimetableData(studentId)
    }
  }, [loadStudentTimetableData, location.key, location.search])

  // 폴백 제거: 학생 선택 시 전역 시간표를 자동 로드하지 않음 (개인 시간표 UX 일관성)

  useEffect(() => {
    // 학생 목록 초기에 로드(좌측 패널)
    studentsList.load({ reset: true })
  }, [])

  // 새로운 TimeTable 이벤트 핸들러
  const handleNewBlockClick = (block: any) => {
    console.log('블록 클릭:', block)
  }

  const handleNewCellClick = (cell: any) => {
    console.log('셀 클릭:', cell)
    // 빈 상태에서도 셀 클릭 시 편집 페이지로 이동하여 즉시 생성할 수 있도록 seed 전달
    const params = new URLSearchParams(location.search)
    const selectedId = params.get('studentId')
    const selectedTimetableId = (document as any).__selectedTimetableId || undefined
    navigate('/timetable/edit', { state: { seed: cell, studentId: selectedId, timetableId: selectedTimetableId } })
  }

  return (
    <BaseWidget className="timetable-page">
      {/* 오류 메시지 */}
      {blocksError && (
        <div className="error-message">
          <Label variant="error" size="small">{blocksError}</Label>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="timetable-content">
        {/* 왼쪽 패널 - 학생 목록 */}
        <div className="student-panel">
          {/* 원생 검색 */}
          <div className="search-container" style={{ padding: '4px 8px' }}>
            <SearchInput 
              placeholder="원생 이름 검색"
              value={searchValue}
              onChange={(v) => setSearchValue(v)}
              onSearch={(v) => {
                const trimmed = v.trim()
                if (!trimmed) return
                const found = studentsList.students.find(s => s.name.replace(/\s+/g,'').includes(trimmed.replace(/\s+/g,'')))
                if (found?.id) navigate(`/timetable?studentId=${found.id}&refresh=1`)
              }}
              suggestions={studentsList.students.map(s => ({ id: s.id as string, label: s.name }))}
              onSelectSuggestion={(item) => {
                setSearchValue(item.label)
                navigate(`/timetable?studentId=${item.id}&refresh=1`)
              }}
              variant="pill"
              showIcon={false}
              size="xs"
              containerStyle={{ maxWidth: 180, height: 28 }}
              inputStyle={{ height: 28, padding: '4px 12px', fontSize: 12 }}
              className="student-search"
            />
          </div>

          <div className="panel-section">
            <Label variant="heading" size="medium" className="section-title">
              학생 목록
            </Label>
            <div className="student-list">
              {studentsList.loading && <div style={{ fontSize: 12, color: '#666' }}>불러오는 중...</div>}
              {studentsList.error && <div style={{ fontSize: 12, color: 'red' }}>{studentsList.error}</div>}
              {studentsList.students.map((s) => (
                <button
                  key={s.id}
                  className="student-item"
                  onClick={() => navigate(`/timetable?studentId=${s.id}&refresh=1`) }
                  style={{ textAlign: 'left' }}
                >
                  <div className="student-status-dot dismissed"></div>
                  <span className="student-name">{s.name}</span>
                  {s.status && <span className="student-status">{s.status}</span>}
                </button>
              ))}
              {!studentsList.loading && studentsList.students.length === 0 && (
                <div style={{ fontSize: 12, color: '#666' }}>학생이 없습니다.</div>
              )}
            </div>
          </div>
          
          <div className="panel-section">
            <Label variant="heading" size="medium" className="section-title">
              고1
            </Label>
            <div className="student-list">
              <div className="student-item">
                <div className="student-status-dot dismissed"></div>
                <span className="student-name">홍길동</span>
                <span className="student-status">미등원</span>
              </div>
              <div className="student-item">
                <div className="student-status-dot dismissed"></div>
                <span className="student-name">학생1</span>
                <span className="student-status">미등원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 - 시간표 */}
        <div className="timetable-panel">
          {/* 선택된 학생 정보 */}
          <div className="selected-student-info" style={{ position: 'relative' }}>
            <button
              style={{ position: 'absolute', right: 0, top: 0, height: 32, padding: '0 12px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                const params = new URLSearchParams(location.search)
                const selectedId = params.get('studentId')
                const selectedTimetableId = (document as any).__selectedTimetableId || undefined
                navigate('/timetable/edit', { state: { studentId: selectedId, timetableId: selectedTimetableId } })
              }}
            >
              시간표 편집
            </button>
            {(() => {
              const params = new URLSearchParams(location.search)
              const selectedId = params.get('studentId')
              const selected = studentsList.students.find((s) => s.id === selectedId)
              return (
                <div className="student-profile">
                  <div className="profile-avatar">
                    <div className="avatar-placeholder">{selected?.name?.[0] || '?'}</div>
                  </div>
                  <div className="student-details">
                    <Label variant="heading" size="medium" className="student-name">
                      {selected ? selected.name : '학생을 선택하세요'}
                    </Label>
                    {selected && (
                      <Label variant="secondary" size="small" className="student-status">
                        {selected.status || ''}
                      </Label>
                    )}
                  </div>
                </div>
              )
            })()}
              <div className="timetable-section">
                {blocksLoading ? (
                  <div className="loading-container">
                    <Label variant="secondary" size="medium">시간표 데이터를 불러오는 중...</Label>
                  </div>
                ) : (
                  (() => {
                    const params = new URLSearchParams(location.search)
                    const selectedId = params.get('studentId')
                    if (!selectedId) {
                      return (
                        <div className="empty-container" style={{ marginBottom: 8 }}>
                          <Label variant="secondary" size="medium">좌측에서 학생을 선택하세요.</Label>
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                            <div>디버그 정보:</div>
                            <div>blocksLoading: {blocksLoading.toString()}</div>
                            <div>hasApiData: {hasApiData.toString()}</div>
                            <div>blocksError: {blocksError || '없음'}</div>
                            <div>apiBlocks 개수: {apiBlocks?.length || 0}</div>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div className="new-timetable-container">
                        {!hasApiData && (
                          <div className="empty-container" style={{ marginBottom: 8 }}>
                            <Label variant="secondary" size="medium">시간표 데이터가 없습니다.</Label>
                            <Label variant="secondary" size="small">빈 격자를 클릭해 블록을 추가하거나, 우상단 버튼으로 편집 페이지로 이동하세요.</Label>
                          </div>
                        )}
                        <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                          로드된 블록: {apiBlocks?.length || 0}개
                        </div>
                        <TimeTable
                          blocks={apiBlocks}
                          eventHandlers={{
                            onBlockClick: handleNewBlockClick,
                            onCellClick: handleNewCellClick
                          }}
                          options={{
                            cellHeight: 28,
                            cellWidth: 60,
                            headerHeight: 25,
                            headerWidth: 45
                          }}
                          className="new-timetable"
                        />
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          </div>
        </div>
    </BaseWidget>
  )
}

export default TimetablePage 