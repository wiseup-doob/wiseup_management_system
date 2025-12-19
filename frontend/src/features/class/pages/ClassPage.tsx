import './ClassPage.css'
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import {
  fetchClasses,
  searchClasses,
  createClass,
  deleteClassAsync,
  setSearchTerm,
  setFilter
} from '../slice/classSlice'
import { apiService } from '../../../services/api'
import type { ClassSchedule, ClassSectionDependencies } from '@shared/types/class-section.types'
import type { ClassFormDataWithIds, ClassSectionWithDetails } from '../types/class.types'

// 새로운 분리된 컴포넌트들 import
import { ClassSearchFilters } from '../components/ClassSearchFilters'
import { ClassList } from '../components/ClassList'
import { ClassDetailPanel } from '../components/ClassDetailPanel'
import { ClassModals } from '../components/ClassModals'
import { TeacherDetailPanel } from '../components/TeacherDetailPanel'
import { ClassScheduleMatrix } from '../components/ClassScheduleMatrix'
import type { EnrolledStudent } from '../types/class.types'
import { SUBJECT_MAP } from '../utils/matrixUtils'

function ClassPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const classes = useAppSelector(state => state.class.classes)
  const searchTerm = useAppSelector(state => state.class.searchTerm)
  const filters = useAppSelector(state => state.class.filters)
  const isLoading = useAppSelector(state => state.class.isLoading)
  const error = useAppSelector(state => state.class.error)

  // 필요한 함수들을 직접 정의
  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value))
    if (value.trim()) {
      dispatch(searchClasses({ name: value.trim() }))
    } else {
      dispatch(fetchClasses())
    }
  }, [dispatch])



  const refreshClasses = useCallback(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  // 수업 선택 핸들러 (선생님 선택 유지)
  const handleClassSelect = useCallback((classItem: ClassSectionWithDetails) => {
    setSelectedClass(classItem)
    // setSelectedTeacher(null) 제거: 선생님 필터 컨텍스트 유지
  }, [])

  // 선생님 정보 패널 닫기 핸들러
  const handleCloseTeacherPanel = useCallback(() => {
    setSelectedTeacher(null)
    dispatch(setFilter({ key: 'teacherName', value: '' }))
  }, [dispatch])

  // 디바운싱을 위한 ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // URL 쿼리 파라미터에서 초기값 가져오기
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '')
  const [urlFilters, setUrlFilters] = useState({
    teacherName: searchParams.get('teacher') || ''
  })

  // 각종 모달 상태들
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassSectionWithDetails | null>(null)

  // 선생님 정보 패널 상태
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<ClassSectionWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [classDependencies, setClassDependencies] = useState<ClassSectionDependencies | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [classToEdit, setClassToEdit] = useState<ClassSectionWithDetails | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // --- [Matrix View] Student Cache State ---
  const [studentCache, setStudentCache] = useState<Record<string, EnrolledStudent[]>>({});
  const invalidateStudentCache = useCallback((classId: string) => {
    setStudentCache(prev => {
      const next = { ...prev };
      delete next[classId];
      return next;
    });
  }, []);

  // 뷰 모드 상태 추가
  const [viewMode, setViewMode] = useState<import('../types/class.types').ClassViewMode>('management')

  const handleViewModeChange = (mode: import('../types/class.types').ClassViewMode) => {
    setViewMode(mode)
    handleClearSearch() // 뷰 모드 변경 시 검색 초기화
    if (mode === 'management') {
      // 뷰 모드 변경 시 필요한 초기화 로직이 있다면 여기에 추가
      setSelectedClass(null)
      setSelectedTeacher(null)
    }
  }

  // 컴포넌트 마운트 시 초기 데이터 로딩
  useEffect(() => {
    const hasSearchParams = searchValue || Object.values(urlFilters).some(f => f)

    if (hasSearchParams) {
      if (searchValue) {
        handleSearchChange(searchValue)
      } else {
        Object.entries(urlFilters).forEach(([key, value]) => {
          if (value) {
            // 초기 로딩 시에는 직접 필터 로직 실행
            if (key === 'teacherName' && value) {
              const teacher = uniqueTeachers.find(t => t.name === value)
              if (teacher) {
                setSelectedTeacher(teacher.id)
                dispatch(searchClasses({ teacherId: teacher.id }))
              } else {
                // 선생님 정보를 못 찾았을 경우 (데이터 미로딩 등) 전체 목록 조회
                dispatch(fetchClasses())
              }
            }
          }
        })
      }
    } else {
      dispatch(fetchClasses())
    }

    return () => {
      setSearchValue('')
      setUrlFilters({ teacherName: '' })
      setCurrentPage(1)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])



  // URL 쿼리 파라미터 업데이트 함수
  const updateSearchParams = useCallback((updates: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value)
      } else {
        newSearchParams.delete(key)
      }
    })
    setSearchParams(newSearchParams)
  }, [searchParams, setSearchParams])

  // 검색 핸들러 (디바운싱 적용)
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value)
    updateSearchParams({ search: value })

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchChange(value)
    }, 300)
  }, [updateSearchParams, handleSearchChange])



  // 모달 핸들러들
  const handleAddNewClass = () => {
    setIsAddClassModalOpen(true)
  }

  const handleCloseAddClassModal = () => {
    setIsAddClassModalOpen(false)
  }

  const handleOpenAddStudentModal = (classItem: ClassSectionWithDetails) => {
    setSelectedClass(classItem)
    setSelectedTeacher(null) // 선생님 선택 해제
    setIsAddStudentModalOpen(true)
  }

  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false)
  }

  const handleClassCreated = useCallback(() => {
    setSuccessMessage({
      title: '수업이 성공적으로 생성되었습니다!',
      description: '새로운 수업이 목록에 추가되었습니다.'
    })
    setShowSuccessMessage(true)

    refreshClasses()
    setSelectedClass(null)
    setSearchValue('')
    setUrlFilters({ teacherName: '' })
    setSearchParams({})

    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }, [refreshClasses])

  const handleEditClass = (classItem: ClassSectionWithDetails) => {
    setClassToEdit(classItem)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setClassToEdit(null)
  }

  const handleClassUpdated = useCallback(() => {
    setSuccessMessage({
      title: '수업이 성공적으로 수정되었습니다!',
      description: '수정된 내용이 목록에 반영되었습니다.'
    })
    setShowSuccessMessage(true)
    refreshClasses()
    setSelectedClass(null)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }, [refreshClasses])

  const handleStudentAdded = useCallback(() => {
    setSuccessMessage({
      title: '학생이 성공적으로 등록되었습니다!',
      description: '수업에 새로운 학생이 추가되었습니다.'
    })
    setShowSuccessMessage(true)

    if (selectedClass) {
      refreshClasses()
      // [Matrix View] Cache Invalidation
      // 모달에서 학생이 추가되었으므로, 해당 수업의 캐시를 지워 매트릭스 뷰에서 다시 로드하게 함
      invalidateStudentCache(selectedClass.id)
    }

    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }, [selectedClass, refreshClasses, invalidateStudentCache])

  const handleDeleteClass = async (classItem: ClassSectionWithDetails) => {
    setClassToDelete(classItem)

    try {
      const response = await apiService.getClassSectionDependencies(classItem.id)
      if (response.success && response.data) {
        setClassDependencies(response.data)
      }
    } catch (error) {
      setClassDependencies(null)
    }

    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setClassToDelete(null)
    setIsDeleting(false)
    setClassDependencies(null)
  }

  const handleConfirmDelete = async () => {
    if (!classToDelete) return

    setIsDeleting(true)

    try {
      const response = await apiService.deleteClassSectionHierarchically(classToDelete.id)

      if (response.success) {
        setSuccessMessage({
          title: '수업이 성공적으로 삭제되었습니다!',
          description: '수업과 관련된 모든 데이터가 함께 삭제되었습니다.'
        })
        setShowSuccessMessage(true)

        if (selectedClass?.id === classToDelete.id) {
          setSelectedClass(null)
        }

        handleCloseDeleteModal()
        refreshClasses()

        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      } else {
        throw new Error('수업 계층적 삭제 실패')
      }

    } catch (error) {
      alert('수업 삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  // 필터링된 클래스 목록
  const filteredClasses = useMemo(() => {
    if (!classes || !Array.isArray(classes) || classes.length === 0) return []

    return classes.filter(classItem => {
      const teacherName = classItem.teacher?.name || classItem.teacherId
      const searchLower = searchTerm.toLowerCase();

      // 과목명 매핑 확인 (예: '국어' -> 'korean' 인데, 여기서는 역방향 검색이 필요하거나, 
      // classItem.course.subject가 'korean'일 때 SUBJECT_MAP['korean'] ('국어') 문자열에 검색어가 포함되는지 확인)
      const subjectCode = classItem.course?.subject || '';
      const subjectName = SUBJECT_MAP[subjectCode] || ''; // '국어', '수학' 등

      const matchesSearch =
        classItem.name.toLowerCase().includes(searchLower) ||
        teacherName.toLowerCase().includes(searchLower) ||
        subjectName.includes(searchTerm) || // 한글 과목명 검색
        subjectCode.toLowerCase().includes(searchLower); // 영어 코드 검색

      const matchesTeacher = !filters.teacherName || teacherName === filters.teacherName

      // Matrix View에서는 'active' 상태가 아니면 필터링될 수 있으나, filteredClasses는 검색 결과만 반환하고 
      // Matrix 컴포넌트 내부의 groupClasses는 status='active'만 처리함. 
      // 여기서는 검색어 매칭만 담당.
      return matchesSearch && matchesTeacher
    })
  }, [classes, searchTerm, filters.teacherName])



  // 페이지네이션 계산
  const paginationData = useMemo(() => {
    if (!filteredClasses || !Array.isArray(filteredClasses)) {
      return {
        totalPages: 0,
        startIndex: 0,
        endIndex: 0,
        currentClasses: []
      }
    }

    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentClasses = filteredClasses.slice(startIndex, endIndex)

    return {
      totalPages,
      startIndex,
      endIndex,
      currentClasses
    }
  }, [filteredClasses, currentPage, itemsPerPage])

  const { totalPages, startIndex, endIndex, currentClasses } = paginationData

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 검색/필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, urlFilters])

  // 고유한 선생님 목록 추출 (teacherId와 name을 포함한 객체 배열)
  const uniqueTeachers = useMemo(() => {
    if (!classes || !Array.isArray(classes)) return []

    const teacherMap = new Map()
    classes.forEach(cls => {
      if (cls.teacherId && cls.teacher?.name) {
        teacherMap.set(cls.teacherId, {
          id: cls.teacherId,
          name: cls.teacher.name
        })
      }
    })

    return Array.from(teacherMap.values())
  }, [classes])

  // uniqueTeachers 업데이트 시 상태 동기화 (새로고침 시 데이터 로드 후 복구용)
  useEffect(() => {
    if (uniqueTeachers.length > 0 && urlFilters.teacherName) {
      const teacher = uniqueTeachers.find(t => t.name === urlFilters.teacherName)
      if (teacher) {
        // 1. 오른쪽 패널 복구
        if (!selectedTeacher) {
          setSelectedTeacher(teacher.id)
        }

        // 2. 왼쪽 리스트 필터링 상태(Redux) 동기화
        // 현재 리덕스 필터가 URL 필터와 다르다면 동기화
        if (filters.teacherName !== teacher.name) {
          dispatch(setFilter({ key: 'teacherName', value: teacher.name }))
        }
      }
    }
  }, [uniqueTeachers, urlFilters.teacherName, selectedTeacher, filters.teacherName, dispatch])

  // 선생님별 수업 데이터 (teacherId로 정확한 필터링)
  const teacherClasses = useMemo(() => {
    if (!selectedTeacher || !classes) return []

    // selectedTeacher가 teacherId인지 teacherName인지 확인
    const teacher = uniqueTeachers.find(t =>
      t.id === selectedTeacher || t.name === selectedTeacher
    )

    if (!teacher) return []

    // teacherId로 정확한 필터링
    return classes.filter(cls => cls.teacherId === teacher.id)
  }, [selectedTeacher, classes, uniqueTeachers])

  // 검색 결과 하이라이트 함수
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text

    // 정규표현식 특수 문자를 이스케이프 처리하여 리터럴 문자로 취급
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedTerm})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  // 필터 변경 핸들러 (teacherName을 teacherId로 변환)
  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }))

    // 선생님 선택 시 선생님 정보 패널 상태 업데이트
    if (key === 'teacherName') {
      if (value) {
        // teacherName을 teacherId로 변환
        const teacher = uniqueTeachers.find(t => t.name === value)
        if (teacher) {
          setSelectedTeacher(teacher.id)  // teacherId 저장
          setSelectedClass(null) // 수업 선택 해제
        }
      } else {
        setSelectedTeacher(null)
      }
    }

    const currentFilters = { ...filters, [key]: value }
    const hasActiveFilters = Object.values(currentFilters).some(filter => filter && filter.trim())

    if (hasActiveFilters) {
      const searchParams: any = {}
      if (currentFilters.teacherName) {
        // teacherName을 teacherId로 변환
        const teacher = uniqueTeachers.find(t => t.name === currentFilters.teacherName)
        if (teacher) {
          searchParams.teacherId = teacher.id  // teacherId로 검색
        }
      }

      dispatch(searchClasses(searchParams))
    } else {
      dispatch(fetchClasses())
    }
  }, [dispatch, filters, uniqueTeachers])

  // 필터 변경 핸들러 (teacherName을 teacherId로 변환)
  const handleFilter = useCallback((key: keyof typeof filters, value: string) => {
    const paramKey = key === 'teacherName' ? 'teacher' : key
    updateSearchParams({ [paramKey]: value })

    setUrlFilters(prev => ({ ...prev, [key]: value }))
    dispatch(setFilter({ key, value }))  // Redux 필터 상태 동기화
    // teacherName을 teacherId로 변환하여 검색
    if (key === 'teacherName') {
      if (value) {
        const teacher = uniqueTeachers.find(t => t.name === value)
        if (teacher) {
          setSelectedTeacher(teacher.id)
          setSelectedClass(null)  // 선생님 선택 시 수업 선택 해제
          dispatch(searchClasses({ teacherId: teacher.id }))
        }
      } else {
        setSelectedTeacher(null)
        dispatch(fetchClasses())
      }
    }
  }, [updateSearchParams, uniqueTeachers, dispatch])

  // 헬퍼 함수들
  // teacherId로 선생님 이름 조회
  const getTeacherName = useCallback((teacherId: string | null) => {
    if (!teacherId) return ''
    const teacher = uniqueTeachers.find(t => t.id === teacherId)
    return teacher?.name || teacherId
  }, [uniqueTeachers])

  // teacherName으로 ID 조회
  const getTeacherId = useCallback((teacherName: string) => {
    const teacher = uniqueTeachers.find(t => t.name === teacherName)
    return teacher?.id || teacherName
  }, [uniqueTeachers])

  // 로딩 중 스켈레톤 UI 렌더링
  const renderSkeleton = useCallback(() => (
    <div className="class-list">
      {[1, 2, 3].map((index) => (
        <div key={index} className="class-item skeleton">
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-status"></div>
          </div>
          <div className="skeleton-details">
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  ), [])

  // 페이지네이션 UI 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const end = Math.min(totalPages, start + maxVisiblePages - 1)

        if (end === totalPages) {
          start = Math.max(1, end - maxVisiblePages + 1)
        }

        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
      }

      return pages
    }

    const pageNumbers = getPageNumbers()

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span className="pagination-text">
            총 {filteredClasses?.length || 0}개 중 {startIndex + 1}-{Math.min(endIndex, filteredClasses?.length || 0)}개 표시
          </span>
        </div>

        <div className="pagination-controls">
          <button
            className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← 이전
          </button>

          <div className="page-numbers">
            {pageNumbers.map(pageNum => (
              <button
                key={pageNum}
                className={`pagination-btn page-btn ${pageNum === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음 →
          </button>
        </div>
      </div>
    )
  }

  // 검색 초기화 함수
  // 검색 초기화 함수
  const handleClearSearch = () => {
    // 1. 로컬 상태 초기화
    setSearchValue('')
    setUrlFilters({ teacherName: '' })
    setSearchParams({})

    // 2. Redux 상태 초기화 (검색바와 동기화)
    dispatch(setSearchTerm(''))
    dispatch(setFilter({ key: 'teacherName', value: '' }))

    // 3. 전체 데이터 다시 불러오기
    refreshClasses()
  }

  return (
    <BaseWidget className="class-page">
      {/* 검색 및 필터 섹션 */}
      <ClassSearchFilters
        searchValue={searchValue}
        onSearch={handleSearch}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        filters={urlFilters}
        onFilter={handleFilter}
        uniqueTeachers={uniqueTeachers}
        onAddNewClass={handleAddNewClass}
        onClear={handleClearSearch}
      />

      {/* 메인 콘텐츠 */}
      <div className="class-content">
        {viewMode === 'list' ? (
          <>
            {/* 왼쪽 패널 - 수업 목록 */}
            <ClassList
              isLoading={isLoading}
              error={error}
              filteredClasses={filteredClasses}
              currentClasses={currentClasses}
              selectedClass={selectedClass}
              searchValue={searchValue}
              filters={urlFilters}
              onSelectClass={handleClassSelect}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
              onOpenAddStudentModal={handleOpenAddStudentModal}
              onAddNewClass={handleAddNewClass}
              onRefreshClasses={refreshClasses}
              onClearSearch={handleClearSearch}
              highlightText={highlightText}
              renderSkeleton={renderSkeleton}
              renderPagination={renderPagination}
            />

            {/* 오른쪽 패널 - 선택된 수업 또는 선생님 상세 정보 */}
            {selectedClass ? (
              <ClassDetailPanel
                selectedClass={selectedClass}
                isLoading={isLoading}
                onRefreshClasses={refreshClasses}
              />
            ) : selectedTeacher ? (
              <TeacherDetailPanel
                teacherName={getTeacherName(selectedTeacher)}
                teacherId={selectedTeacher}
                classes={teacherClasses}
                onClose={handleCloseTeacherPanel}
                onRefreshClasses={refreshClasses}
              />
            ) : null}
          </>
        ) : (
          /* 전체 수업 관리 모드 (매트릭스 뷰) */
          <ClassScheduleMatrix
            classes={filteredClasses} // 필터링된 클래스 전달 (검색 적용)
            studentCache={studentCache}
            setStudentCache={setStudentCache}
            onEditClass={handleEditClass}
          />
        )}
      </div>

      {/* 모든 모달들 */}
      <ClassModals
        showSuccessMessage={showSuccessMessage}
        successMessage={successMessage}
        isAddClassModalOpen={isAddClassModalOpen}
        onCloseAddClassModal={handleCloseAddClassModal}
        onClassCreated={handleClassCreated}
        isAddStudentModalOpen={isAddStudentModalOpen}
        selectedClass={selectedClass}
        onCloseAddStudentModal={handleCloseAddStudentModal}
        onStudentAdded={handleStudentAdded}
        isDeleteModalOpen={isDeleteModalOpen}
        classToDelete={classToDelete}
        classDependencies={classDependencies}
        isDeleting={isDeleting}
        onCloseDeleteModal={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
        isEditModalOpen={isEditModalOpen}
        classToEdit={classToEdit}
        onCloseEditModal={handleCloseEditModal}
        onClassUpdated={handleClassUpdated}
      />
    </BaseWidget>
  )
}

export default ClassPage