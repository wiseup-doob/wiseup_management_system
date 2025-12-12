import './SchedulePage.css'
import React, { useState, useCallback, useEffect } from 'react'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { Button } from '../../../components/buttons/Button'
import { TimetableWidget, TimetableDownloadModal, BulkTimetableDownloadModal } from '../../../components/business/timetable'
import type { Student } from '@shared/types'
import { useStudents, useStudentSearch } from '../hooks'
import { TimetableEditModal } from '../components/TimetableEditModal'
import { ClassDetailModal } from '../../../components/business/ClassDetailModal'
import { apiService } from '../../../services/api'
import { TimetableVersionSelector } from '../../../components/TimetableVersionSelector'
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
import { timeCalculations } from '../../../components/business/timetable/utils/timeCalculations'

function SchedulePage() {
  // 시간표 버전 관리
  const { selectedVersion } = useTimetableVersion()

  // 학생 목록 관리
  const { students, isLoading, error, loadStudents } = useStudents()

  // 학생 검색 및 필터링
  const {
    searchValue,
    filters,
    searchResults,
    isSearching,
    searchError,
    handleSearch,
    handleFilter
  } = useStudentSearch(students)

  // 선택된 학생 상태
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // 학생 시간표 관리 (직접 API 호출)
  const [timetableData, setTimetableData] = useState<any>(null)
  const [isTimetableLoading, setIsTimetableLoading] = useState(false)
  const [timetableError, setTimetableError] = useState<string | null>(null)

  // 모달 상태 관리
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isBulkDownloadModalOpen, setIsBulkDownloadModalOpen] = useState(false)
  const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  // 시간표 로드 함수
  const loadTimetable = useCallback(async (student: Student) => {
    if (!student || !selectedVersion) return

    setIsTimetableLoading(true)
    setTimetableError(null)
    setTimetableData(null) // 기존 데이터 초기화

    try {
      console.log(`📚 ${student.name}의 시간표 로드 시작 (버전: ${selectedVersion.displayName})...`)

      const response = await apiService.getStudentTimetableByVersion(student.id, selectedVersion.id)

      if (response.success && response.data && response.data.classSections) {
        console.log('✅ 시간표 데이터 로드 성공:', response.data)

        // useTimetable 훅이 기대하는 구조로 변환
        const data = {
          classSections: response.data.classSections,
          conflicts: [],
          metadata: {
            totalClasses: response.data.classSections.length,
            totalStudents: 1,
            totalTeachers: 0
          }
        }

        setTimetableData(data)
        console.log(`📚 ${student.name}의 시간표 로드 완료`, data)

      } else {
        // 시간표가 없는 경우
        if (response.message?.includes('not found') ||
            response.message?.includes('Student timetable not found') ||
            response.message?.includes('Resource not found')) {
          console.log(`📚 ${student.name}의 시간표가 없습니다.`)
          setTimetableData({
            classSections: [],
            conflicts: [],
            metadata: { totalClasses: 0, totalStudents: 1, totalTeachers: 0 }
          })
          setTimetableError(null)
        } else {
          const errorMessage = response.message || '시간표를 불러오는데 실패했습니다.'
          setTimetableError(errorMessage)
          setTimetableData(null)
          console.error('❌ 시간표 로드 실패:', errorMessage)
        }
      }

    } catch (err) {
      const errorMessage = '시간표를 불러오는 중 오류가 발생했습니다.'
      setTimetableError(errorMessage)
      setTimetableData(null)
      console.error('❌ 시간표 로드 오류:', err)
    } finally {
      setIsTimetableLoading(false)
    }
  }, [selectedVersion])

  // 학생 선택 시 또는 버전 변경 시 시간표 로드
  useEffect(() => {
    if (selectedStudent && selectedVersion) {
      loadTimetable(selectedStudent)
    }
  }, [selectedStudent, selectedVersion, loadTimetable])

  // 학생 선택 핸들러
  const handleStudentSelect = useCallback((student: Student) => {
    setSelectedStudent(student)
  }, [])

  // 시간표 편집 핸들러
  const handleEditTimetable = useCallback(() => {
    // 나중에 실제 추가 로직 구현
  }, [])

  // 모달 열기/닫기 핸들러
  const handleOpenEditModal = useCallback(() => {
    setIsEditModalOpen(true)
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false)
  }, [])

  // 다운로드 모달 열기/닫기 핸들러
  const handleOpenDownloadModal = useCallback(() => {
    setIsDownloadModalOpen(true)
  }, [])

  const handleCloseDownloadModal = useCallback(() => {
    setIsDownloadModalOpen(false)
  }, [])

  // 전체 다운로드 모달 열기/닫기 핸들러
  const handleOpenBulkDownloadModal = useCallback(() => {
    setIsBulkDownloadModalOpen(true)
  }, [])

  const handleCloseBulkDownloadModal = useCallback(() => {
    setIsBulkDownloadModalOpen(false)
  }, [])

  // 수업 상세 모달 열기/닫기 핸들러
  const handleClassClick = useCallback((classData: any) => {
    console.log('🎯 시간표 수업 클릭:', classData)

    // 🆕 클리핑된 데이터를 원본 시간으로 복원
    const restoredClassData = {
      ...classData,
      startTime: classData.originalStartTime || classData.startTime,
      endTime: classData.originalEndTime || classData.endTime,
      duration: classData.originalStartTime && classData.originalEndTime
        ? timeCalculations.timeToMinutes(classData.originalEndTime) -
          timeCalculations.timeToMinutes(classData.originalStartTime)
        : classData.duration
    }

    console.log('🔄 원본 시간 복원:', {
      클리핑됨: `${classData.startTime}~${classData.endTime}`,
      원본: `${restoredClassData.startTime}~${restoredClassData.endTime}`
    })

    setSelectedClassId(restoredClassData.id)
    setIsClassDetailModalOpen(true)
  }, [])

  const handleCloseClassDetailModal = useCallback(() => {
    setIsClassDetailModalOpen(false)
    setSelectedClassId(null)
  }, [])

  // 색상 저장 후 시간표 새로고침 콜백
  const handleColorSaved = useCallback(() => {
    console.log('🎨 색상 저장됨, 시간표 새로고침')
    // 선택된 학생이 있으면 해당 학생의 시간표 새로고침
    if (selectedStudent) {
      loadTimetable(selectedStudent)
    }
  }, [selectedStudent, loadTimetable])


  // 시간표 저장 핸들러
  const handleSaveTimetable = useCallback(() => {
    // 선택된 학생의 시간표를 새로고침
    if (selectedStudent) {
      loadTimetable(selectedStudent)
    }
  }, [selectedStudent, loadTimetable])

  // 에러 상태 결정 (학생 목록 에러, 검색 에러, 또는 시간표 에러)
  const currentError = error || searchError || timetableError
  const currentIsLoading = isLoading || isSearching || isTimetableLoading

  return (
    <BaseWidget className="schedule-page">
      {/* 검색 및 필터 섹션 */}
      <div className="search-filter-section">
        <div className="search-container">
          <SearchInput
            placeholder="학생 이름 검색"
            value={searchValue}
            onChange={handleSearch}
            onSearch={handleSearch}
            variant="pill"
            showIcon={true}
            size="md"
          />
        </div>

        <div className="filter-buttons">
          {/* 시간표 버전 선택 */}
          <TimetableVersionSelector style={{ marginRight: '12px' }} />

          <select
            value={filters.grade}
            onChange={(e) => handleFilter('grade', e.target.value)}
            className="filter-select"
          >
            <option value="">전체 학년</option>
            <option value="중1">중1</option>
            <option value="중2">중2</option>
            <option value="중3">중3</option>
            <option value="고1">고1</option>
            <option value="고2">고2</option>
            <option value="고3">고3</option>
          </select>

          <Button
            onClick={handleOpenBulkDownloadModal}
            className="bulk-download-btn"
            variant="primary"
            size="small"
            disabled={searchResults.length === 0}
          >
            📦 전체 시간표 다운로드
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="schedule-content">
        {/* 왼쪽 패널 - 학생 목록 */}
        <div className="student-panel">
          <div className="panel-section">
            <Label variant="heading" size="medium" className="section-title">
              학생 목록
            </Label>
            
            {currentIsLoading ? (
              <div className="loading-state">
                <Label variant="secondary" size="medium">
                  {isLoading ? '학생 목록을 불러오는 중...' : 
                   isSearching ? '검색 중...' : '시간표를 불러오는 중...'}
                </Label>
              </div>
            ) : currentError ? (
              <div className="error-state">
                <Label variant="secondary" size="medium" className="error-text">{currentError}</Label>
                <Button 
                  onClick={loadStudents}
                  variant="secondary"
                  size="small"
                  className="retry-btn"
                >
                  다시 시도
                </Button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="empty-state">
                <Label variant="secondary" size="medium">
                  {searchValue.trim() ? '검색 결과가 없습니다.' : '등록된 학생이 없습니다.'}
                </Label>
              </div>
            ) : (
              <div className="student-list">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    data-student-id={student.id}
                    className={`schedule-student-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="schedule-student-item-header">
                      <div className="schedule-student-item-name">
                        {student.name}
                      </div>
                      <span className={`schedule-student-status ${student.status}`}>
                        {student.status === 'active' ? '활성' :
                         student.status === 'inactive' ? '비활성' : '완료'}
                      </span>
                    </div>
                    <div className="schedule-student-item-details">
                      <div className="detail-row">
                        <span className="detail-label">학년:</span>
                        <span className="detail-value">{student.grade}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 패널 - 선택된 학생 시간표 정보 */}
        <div className="student-detail-panel">
          <div className="detail-header">
            <div className="detail-header-content">
              <div className="detail-title-section">
                <Label variant="heading" size="medium" className="section-title">
                  {selectedStudent ? `${selectedStudent.name} 시간표 정보` : '학생 시간표 정보'}
                </Label>
                <Label variant="secondary" size="small" className="detail-subtitle">
                  {selectedStudent ? `${selectedStudent.grade} | ${selectedStudent.status === 'active' ? '활성' : '비활성'}` : '좌측에서 학생을 선택하세요'}
                </Label>
              </div>
              
              {/* 버튼 그룹 - 학생이 선택되었을 때만 표시 */}
              {selectedStudent && (
                <div className="action-buttons">
                  <Button 
                    onClick={handleOpenEditModal}
                    className="edit-timetable-btn"
                    variant="primary"
                    size="small"
                  >
                    시간표 편집
                  </Button>
                  <Button 
                    onClick={handleOpenDownloadModal}
                    className="download-timetable-btn"
                    variant="secondary"
                    size="small"
                  >
                    📥 시간표 다운로드
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="detail-content">
            {selectedStudent ? (
              <div className="student-detail-info">
                {isTimetableLoading ? (
                  <div className="timetable-loading">
                    <Label variant="secondary" size="medium">시간표를 불러오는 중...</Label>
                  </div>
                ) : timetableError ? (
                  <div className="timetable-error">
                    <Label variant="secondary" size="medium" className="error-text">{timetableError}</Label>
                    <Button 
                      onClick={() => loadTimetable(selectedStudent)}
                      variant="secondary"
                      size="small"
                      className="retry-btn"
                    >
                      다시 시도
                    </Button>
                  </div>
                ) : (
                  <div className="timetable-widget-container">
                    {timetableData && timetableData.classSections ? (
                      <TimetableWidget 
                        data={{
                          classSections: timetableData.classSections,
                          conflicts: [],
                          metadata: {
                            totalClasses: timetableData.classSections.length,
                            totalStudents: 1,
                            totalTeachers: 0
                          }
                        }}
                        className="student-timetable-widget"
                        data-student-id={selectedStudent.id}
                        onClassClick={handleClassClick}
                      />
                    ) : (
                      <div className="timetable-loading">
                        <Label variant="secondary" size="medium">
                          {isTimetableLoading ? '시간표를 불러오는 중...' : '시간표 데이터가 없습니다.'}
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-detail">
                <Label variant="secondary" size="medium">
                  학생을 선택하면 시간표 정보가 표시됩니다.
                </Label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 시간표 편집 모달 */}
      <TimetableEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        student={selectedStudent}
        timetableData={timetableData}
        onSave={handleSaveTimetable}
      />
      
      {/* 시간표 다운로드 모달 */}
      <TimetableDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={handleCloseDownloadModal}
        timetableData={timetableData}
        studentInfo={selectedStudent ? {
          name: selectedStudent.name,
          grade: selectedStudent.grade,
          status: selectedStudent.status
        } : undefined}
      />
      
      {/* 전체 시간표 다운로드 모달 */}
      <BulkTimetableDownloadModal
        isOpen={isBulkDownloadModalOpen}
        onClose={handleCloseBulkDownloadModal}
        students={searchResults.map(student => ({
          id: student.id,
          name: student.name,
          grade: student.grade,
          status: student.status,
          isSelected: false, // 기본적으로 선택되지 않음
          timetableData: student.id === selectedStudent?.id ? timetableData : null
        }))}
        onStudentsUpdate={(updatedStudents) => {
          // 학생 선택 상태 업데이트를 처리할 수 있는 콜백
          console.log('학생 선택 상태 업데이트:', updatedStudents)
        }}
      />
      
      {/* 수업 상세 정보 모달 */}
      <ClassDetailModal
        isOpen={isClassDetailModalOpen}
        onClose={handleCloseClassDetailModal}
        classSectionId={selectedClassId}
        onColorSaved={handleColorSaved}
      />
    </BaseWidget>
  )
}

export default SchedulePage
