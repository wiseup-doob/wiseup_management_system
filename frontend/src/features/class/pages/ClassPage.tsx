import './ClassPage.css'
import React, { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { BaseWidget } from '../../../components/base/BaseWidget'
import { Label } from '../../../components/labels/Label'
import { SearchInput } from '../../../components/SearchInput/SearchInput'
import { Button } from '../../../components/buttons/Button'
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
import type { ClassSection, ClassSchedule, ClassSectionDependencies } from '@shared/types/class-section.types'
import type { ClassFormDataWithIds, ClassSectionWithDetails } from '../types/class.types'
// TimetableWidget과 관련 컴포넌트들 import
import { TimetableWidget, TimetableSkeleton, EmptyTimetableState } from '../../../components/business/timetable'

// 동적 import로 번들 크기 최적화
const AddClassPage = React.lazy(() => import('./AddClassPage'))
const EditClassPage = React.lazy(() => import('./EditClassPage'))
const AddStudentPage = React.lazy(() => import('./AddStudentPage'))
// ClassTable import 제거 - TimetableWidget으로 대체
// const ClassTable = React.lazy(() => import('../components/ClassTable').then(module => ({ default: module.ClassTable })))
// TimeInputForm import 제거

function ClassPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  // useClass 훅 사용 제거 - 무한 루프 방지
  // 필요한 상태와 함수만 직접 Redux에서 가져오기
  const dispatch = useAppDispatch()
  const classes = useAppSelector(state => state.class.classes)
  const searchTerm = useAppSelector(state => state.class.searchTerm)
  const filters = useAppSelector(state => state.class.filters)
  const isLoading = useAppSelector(state => state.class.isLoading)
  const error = useAppSelector(state => state.class.error)
  
  // 필요한 함수들을 직접 정의
  const handleSearchChange = useCallback((value: string) => {
    dispatch(setSearchTerm(value))
    // 검색어가 있으면 API로 검색, 없으면 전체 목록 조회
    if (value.trim()) {
      dispatch(searchClasses({ name: value.trim() }))
    } else {
      dispatch(fetchClasses())
    }
  }, [dispatch])

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    dispatch(setFilter({ key, value }))
    
    // 필터 변경 시 API로 검색
    const currentFilters = { ...filters, [key]: value }
    const hasActiveFilters = Object.values(currentFilters).some(filter => filter && filter.trim())
    
    if (hasActiveFilters) {
      // 활성 필터가 있으면 검색 API 호출
      const searchParams: any = {}
      if (currentFilters.teacherName) searchParams.teacherName = currentFilters.teacherName
      if (currentFilters.status) searchParams.status = currentFilters.status
      
      dispatch(searchClasses(searchParams))
    } else {
      // 활성 필터가 없으면 전체 목록 조회
      dispatch(fetchClasses())
    }
  }, [dispatch, filters])

  const refreshClasses = useCallback(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  const handleAddClass = useCallback(async (classData: ClassFormDataWithIds) => {
    try {
      await dispatch(createClass(classData)).unwrap()
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('수업 생성 실패:', error)
      throw error
    }
  }, [dispatch])

  const deleteClassFromHook = useCallback(async (id: string) => {
    try {
      await dispatch(deleteClassAsync(id)).unwrap()
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('수업 삭제 실패:', error)
      throw error
    }
  }, [dispatch])

  // 디바운싱을 위한 ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // URL 쿼리 파라미터에서 초기값 가져오기
  const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '')
  const [urlFilters, setUrlFilters] = useState({
    teacherName: searchParams.get('teacher') || '',
    status: searchParams.get('status') || ''
  })

  // 수업 추가 모달 상태
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false)
  
  // 학생 추가 모달 상태
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  
  // 선택된 수업 상태
  const [selectedClass, setSelectedClass] = useState<ClassSectionWithDetails | null>(null)

  // 성공 메시지 상태
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: '', description: '' })

  // 삭제 확인 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<ClassSectionWithDetails | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // 수업 의존성 정보 상태
  const [classDependencies, setClassDependencies] = useState<ClassSectionDependencies | null>(null)

  // 편집 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [classToEdit, setClassToEdit] = useState<ClassSectionWithDetails | null>(null)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // 페이지당 표시할 항목 수

  // 시간표 편집 관련 상태 제거

  // 컴포넌트 마운트 시 초기 데이터 로딩 및 URL 쿼리 파라미터 기반 검색 수행
  useEffect(() => {
    const hasSearchParams = searchValue || Object.values(urlFilters).some(f => f)
    
    if (hasSearchParams) {
      // 검색 파라미터가 있으면 검색 API 호출
      const searchParams: any = {}
      if (searchValue) searchParams.name = searchValue
      if (urlFilters.teacherName) searchParams.teacherName = urlFilters.teacherName
      if (urlFilters.status) searchParams.status = urlFilters.status
      
      // 검색어가 있으면 검색, 없으면 필터만 적용
      if (searchValue) {
        handleSearchChange(searchValue)
      } else {
        // 필터만 적용
        Object.entries(urlFilters).forEach(([key, value]) => {
          if (value) {
            handleFilterChange(key as keyof typeof filters, value)
          }
        })
      }
    } else {
      // 검색 파라미터가 없으면 기본 수업 목록 로딩
      console.log('초기 수업 목록 로딩 시작...')
      dispatch(fetchClasses())
    }
    
    // cleanup 함수 - 컴포넌트 언마운트 시 정리
    return () => {
      // 검색 상태 초기화
      setSearchValue('')
      setUrlFilters({ teacherName: '', status: '' })
      setCurrentPage(1)
    }
  }, []) // 컴포넌트 마운트 시에만 실행

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // 시간표 관련 useEffect 제거

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
    console.log('검색어 변경:', value)
    setSearchValue(value)
    
    // URL 쿼리 파라미터 업데이트
    updateSearchParams({ search: value })
    
    // 이전 타이머가 있으면 취소
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // 300ms 후에 API 호출 (디바운싱)
    searchTimeoutRef.current = setTimeout(() => {
      handleSearchChange(value)
    }, 300)
  }, [updateSearchParams, handleSearchChange])

  // 필터 변경 핸들러
  const handleFilter = useCallback((key: keyof typeof filters, value: string) => {
    // URL 쿼리 파라미터 업데이트
    const paramKey = key === 'teacherName' ? 'teacher' : key
    updateSearchParams({ [paramKey]: value })
    
    // 로컬 상태 업데이트
    setUrlFilters(prev => ({ ...prev, [key]: value }))
    
    // API 호출
    handleFilterChange(key, value)
  }, [updateSearchParams, handleFilterChange])

  // 수업 추가 핸들러
  const handleAddNewClass = () => {
    console.log('새 수업 추가 모달 열기')
    setIsAddClassModalOpen(true)
  }
  
  // 수업 추가 모달 닫기 핸들러
  const handleCloseAddClassModal = () => {
    setIsAddClassModalOpen(false)
  }

  // 학생 추가 모달 열기 핸들러
  const handleOpenAddStudentModal = (classItem: ClassSectionWithDetails) => {
    setSelectedClass(classItem)
    setIsAddStudentModalOpen(true)
  }

  // 학생 추가 모달 닫기 핸들러
  const handleCloseAddStudentModal = () => {
    setIsAddStudentModalOpen(false)
  }

  // 수업 생성 완료 후 콜백
  const handleClassCreated = useCallback(() => {
    console.log('새 수업이 생성되었습니다. 목록을 새로고침합니다.')
    
    // 성공 메시지 표시
    setSuccessMessage({
      title: '수업이 성공적으로 생성되었습니다!',
      description: '새로운 수업이 목록에 추가되었습니다.'
    })
    setShowSuccessMessage(true)
    
    // 목록 새로고침
    refreshClasses()
    
    // 선택된 수업 초기화
    setSelectedClass(null)
    
    // 검색 및 필터 초기화
    setSearchValue('')
    setUrlFilters({ teacherName: '', status: '' })
    setSearchParams({})
    
    // 3초 후 성공 메시지 자동 숨김
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }, [refreshClasses])

  // 수업 편집 핸들러
  const handleEditClass = (classItem: ClassSectionWithDetails) => {
    console.log('수업 편집:', classItem)
    setClassToEdit(classItem)
    setIsEditModalOpen(true)
  }

  // 편집 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setClassToEdit(null)
  }

  // 수업 편집 완료 후 콜백
  const handleClassUpdated = useCallback(() => {
    console.log('수업이 수정되었습니다. 목록을 새로고침합니다.')
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

  // 학생 추가 완료 후 콜백
  const handleStudentAdded = useCallback(() => {
    console.log('학생이 추가되었습니다. 수업 정보를 새로고침합니다.')
    setSuccessMessage({
      title: '학생이 성공적으로 등록되었습니다!',
      description: '수업에 새로운 학생이 추가되었습니다.'
    })
    setShowSuccessMessage(true)
    
    // 선택된 수업 정보 새로고침
    if (selectedClass) {
      refreshClasses()
    }
    
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }, [selectedClass, refreshClasses])

  // 수업 의존성 확인 및 삭제 모달 열기
  const handleDeleteClass = async (classItem: ClassSectionWithDetails) => {
    console.log('수업 삭제:', classItem)
    setClassToDelete(classItem)
    
    try {
      // 수업 의존성 정보 미리 확인
      const response = await apiService.getClassSectionDependencies(classItem.id)
      if (response.success && response.data) {
        setClassDependencies(response.data)
      }
    } catch (error) {
      console.error('수업 의존성 확인 실패:', error)
      // 에러가 발생해도 모달은 열기
      setClassDependencies(null)
    }
    
    setIsDeleteModalOpen(true)
  }

  // 삭제 확인 모달 닫기
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setClassToDelete(null)
    setIsDeleting(false)
    // 의존성 정보 초기화
    setClassDependencies(null)
  }

  // 실제 삭제 실행 (계층적 삭제)
  const handleConfirmDelete = async () => {
    if (!classToDelete) return

    setIsDeleting(true)
    
    try {
      // 계층적 삭제 API 호출
      const response = await apiService.deleteClassSectionHierarchically(classToDelete.id)
      
      if (response.success) {
        console.log('수업 계층적 삭제 완료:', response.data)
        
        // 성공 메시지 표시
        setSuccessMessage({
          title: '수업이 성공적으로 삭제되었습니다!',
          description: '수업과 관련된 모든 데이터가 함께 삭제되었습니다.'
        })
        setShowSuccessMessage(true)
        
        // 선택된 수업이 삭제된 경우 초기화
        if (selectedClass?.id === classToDelete.id) {
          setSelectedClass(null)
        }
        
        // 모달 닫기
        handleCloseDeleteModal()
        
        // 목록 새로고침
        refreshClasses()
        
        // 3초 후 성공 메시지 자동 숨김
        setTimeout(() => {
          setShowSuccessMessage(false)
        }, 3000)
      } else {
        throw new Error('수업 계층적 삭제 실패')
      }
      
    } catch (error) {
      console.error('수업 삭제 실패:', error)
      // 에러 처리 (사용자에게 알림 등)
      alert('수업 삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  // 필터링된 클래스 목록 - useMemo로 최적화
  const filteredClasses = useMemo(() => {
    // classes가 로드되지 않았거나 빈 배열인 경우 빈 배열 반환
    if (!classes || !Array.isArray(classes) || classes.length === 0) return []
    
    return classes.filter(classItem => {
      const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTeacher = !filters.teacherName || classItem.teacherId === filters.teacherName
      const matchesStatus = !filters.status || classItem.status === filters.status
      
      return matchesSearch && matchesTeacher && matchesStatus
    })
  }, [classes, searchTerm, filters.teacherName, filters.status])

  // 페이지네이션 계산 - useMemo로 최적화
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
    // 페이지 변경 시 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 시간표 편집 관련 핸들러 제거

  // 검색/필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, urlFilters])

  // schedule 문자열을 ClassSchedule 배열로 파싱하는 함수
  const parseScheduleString = useCallback((scheduleStr: string): ClassSchedule[] => {
    if (!scheduleStr || typeof scheduleStr !== 'string') return []
    
    try {
      // schedule이 JSON 문자열인 경우 파싱
      if (scheduleStr.startsWith('[') || scheduleStr.startsWith('{')) {
        const parsed = JSON.parse(scheduleStr)
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            dayOfWeek: item.dayOfWeek || 'monday',
            startTime: item.startTime || '09:00',
            endTime: item.endTime || '10:00'
          }))
        }
      }
      
      // 기본값 반환 (빈 배열)
      return []
    } catch (error) {
      console.warn('Schedule 파싱 실패:', error)
      return []
    }
  }, [])

  // 디버깅: selectedClass 상태 확인
  useEffect(() => {
    if (selectedClass) {
      console.log('🔍 Selected Class:', selectedClass)
      console.log('📅 Schedule String:', selectedClass.schedule)
    } else {
      console.log('❌ selectedClass가 null입니다')
    }
  }, [selectedClass])

  // 검색 결과 하이라이트 함수
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  // 고유한 선생님 목록 추출 - useMemo로 최적화 (ClassSection에는 grade가 없음)
  const uniqueTeachers = useMemo(() => {
    if (!classes || !Array.isArray(classes)) return []
    return [...new Set(classes.map(c => c.teacherId))]
  }, [classes])

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

  // 에러 상태 UI 렌더링
  const renderError = () => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-message">
        <h3>데이터를 불러오는 중 오류가 발생했습니다</h3>
        <p>{error}</p>
        <Button 
          onClick={refreshClasses}
          variant="primary"
          className="retry-button"
        >
          다시 시도
        </Button>
      </div>
    </div>
  )

  // 빈 데이터 상태 UI 렌더링
  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📚</div>
      <div className="empty-message">
        <h3>등록된 수업이 없습니다</h3>
        <p>새로운 수업을 추가해보세요!</p>
        <Button 
          onClick={handleAddNewClass}
          variant="primary"
          className="add-first-class-btn"
        >
          첫 수업 추가하기
        </Button>
      </div>
    </div>
  )

  // 페이지네이션 UI 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        // 전체 페이지가 5개 이하면 모두 표시
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 현재 페이지를 중심으로 최대 5개 페이지 표시
        let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        let end = Math.min(totalPages, start + maxVisiblePages - 1)
        
        // 끝에 가까우면 시작점 조정
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
          {/* 이전 페이지 버튼 */}
          <button
            className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← 이전
          </button>
          
          {/* 페이지 번호 버튼들 */}
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
          
          {/* 다음 페이지 버튼 */}
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

  // 더미 일정 데이터 생성 (ClassSection 기반) - 향후 사용 예정
  // const generateDummySchedule = (classItem: Class) => {
  //   return [
  //     {
  //       dayOfWeek: 'monday',
  //       startTime: '09:00',
  //       endTime: '10:00'
  //     },
  //     {
  //       dayOfWeek: 'wednesday',
  //       startTime: '14:00',
  //       endTime: '15:00'
  //     },
  //     {
  //       dayOfWeek: 'friday',
  //       startTime: '16:00',
  //       endTime: '17:00'
  //     }
  //   ]
  // }

  return (
    <BaseWidget className="class-page">
      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="success-toast">
          <div className="success-toast-content">
            <div className="success-toast-icon">✓</div>
            <div className="success-toast-message">
              <h4>{successMessage.title}</h4>
              <p>{successMessage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 검색 및 필터 섹션 */}
      <div className="search-filter-section">
        <div className="search-container">
          <SearchInput 
            placeholder="수업명 또는 선생님 검색"
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            variant="pill"
            showIcon={true}
            size="md"
          />
        </div>
        
        <div className="filter-buttons">
          <select 
            value={filters.teacherName} 
            onChange={(e) => handleFilter('teacherName', e.target.value)}
            className="filter-select"
          >
            <option value="">전체 선생님</option>
            {uniqueTeachers.map(teacher => (
              <option key={teacher} value={teacher}>{teacher}</option>
            ))}
          </select>
          
          <select 
            value={filters.status} 
            onChange={(e) => handleFilter('status', e.target.value)}
            className="filter-select"
          >
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="completed">완료</option>
          </select>
          
          <Button 
            onClick={handleAddNewClass}
            className="add-class-btn"
            variant="primary"
          >
            수업 추가
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 - 수업 목록만 표시 */}
      <div className="class-content">
        {/* 왼쪽 패널 - 수업 목록 */}
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
                searchTerm || Object.values(filters).some(f => f) ? (
                  <div className="empty-message">
                    <Label variant="secondary" size="small">
                      검색 결과가 없습니다.
                    </Label>
                    <Button 
                      onClick={() => {
                                // 검색어와 필터 초기화
        setSearchValue('')
        setUrlFilters({ teacherName: '', status: '' })
        // URL 쿼리 파라미터 초기화
        setSearchParams({})
                        // 전체 목록 다시 로드
                        refreshClasses()
                      }}
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
                    onClick={() => setSelectedClass(classItem)}
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
                        onClick={() => handleEditClass(classItem)}
                        variant="secondary"
                        size="small"
                        className="edit-btn"
                      >
                        편집
                      </Button>
                      <Button 
                        onClick={() => handleOpenAddStudentModal(classItem)}
                        variant="primary"
                        size="small"
                        className="add-student-btn"
                      >
                        학생 추가
                      </Button>
                      <Button 
                        onClick={() => handleDeleteClass(classItem)}
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

        {/* 오른쪽 패널 - 선택된 수업 상세 정보 */}
        <div className="class-detail-panel">
          <div className="detail-header">
            <Label variant="heading" size="medium" className="section-title">
              {selectedClass ? `${selectedClass.name} 상세 정보` : '수업 상세 정보'}
            </Label>
            <Label variant="secondary" size="small" className="detail-subtitle">
              {selectedClass ? `${selectedClass.teacherId} 담당 | ${selectedClass.classroomId}` : '좌측에서 수업을 선택하세요'}
            </Label>
          </div>
          
          <div className="detail-content">
            {isLoading ? (
              <div className="detail-skeleton">
                <div className="skeleton-section">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-grid">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="skeleton-info-item">
                        <div className="skeleton-label"></div>
                        <div className="skeleton-value"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="skeleton-section">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-timetable"></div>
                </div>
              </div>
            ) : selectedClass ? (
              <div className="class-detail-info">
                {/* 기본 정보 */}
                <div className="class-info-section">
                  <h3>기본 정보</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">담당 교사:</span>
                      <span className="info-value">
                        {selectedClass.teacher?.name || selectedClass.teacherId}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">강의실:</span>
                      <span className="info-value">
                        {selectedClass.classroom?.name || selectedClass.classroomId}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">과목:</span>
                      <span className="info-value">
                        {selectedClass.course?.name || '미정'} ({selectedClass.course?.subject || '미정'})
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">학생 수:</span>
                      <span className="info-value">{selectedClass.currentStudents}/{selectedClass.maxStudents}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">상태:</span>
                      <span className={`info-value status-${selectedClass.status}`}>
                        {selectedClass.status === 'active' ? '활성' : 
                         selectedClass.status === 'inactive' ? '비활성' : '완료'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 시간표 */}
                <div className="timetable-section">
                  <h3>수업 일정</h3>
                  <div className="timetable-container">
                    {!selectedClass ? (
                      <div className="empty-timetable-message">
                        <Label variant="secondary" size="medium">
                          좌측에서 수업을 선택하면 시간표가 표시됩니다.
                        </Label>
                      </div>
                    ) : isLoading ? (
                      <TimetableSkeleton /> 
                    ) : (
                      <TimetableWidget 
                        data={selectedClass} // 단일 객체 직접 전달
                        startHour={9}
                        endHour={23}
                        // timeInterval prop 제거 - 30분으로 고정
                        showConflicts={true}
                        showEmptySlots={true}
                        showTimeLabels={true}
                        onClassClick={(classData) => {
                          console.log('시간표에서 수업 클릭:', classData)
                        }}
                        className="class-timetable-widget"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-detail">
                <Label variant="secondary" size="medium">
                  수업을 선택하면 상세 정보가 표시됩니다.
                </Label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 수업 추가 모달 */}
      <Suspense fallback={<div className="modal-loading">모달 로딩 중...</div>}>
        <AddClassPage 
          isOpen={isAddClassModalOpen}
          onClose={handleCloseAddClassModal}
          onClassCreated={handleClassCreated}
        />
      </Suspense>

      {/* 학생 추가 모달 */}
      {isAddStudentModalOpen && selectedClass && (
        <Suspense fallback={<div className="modal-loading">모달 로딩 중...</div>}>
          <AddStudentPage
            isOpen={isAddStudentModalOpen}
            onClose={handleCloseAddStudentModal}
            classData={selectedClass}
            onStudentAdded={handleStudentAdded}
          />
        </Suspense>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && classToDelete && (
        <div className="delete-modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h2>수업 삭제 확인</h2>
              <button className="close-button" onClick={handleCloseDeleteModal}>
                ✕
              </button>
            </div>
            
            <div className="delete-modal-body">
              <div className="warning-icon">⚠️</div>
              <h3>정말로 이 수업을 삭제하시겠습니까?</h3>
              <p>삭제된 수업은 복구할 수 없습니다.</p>
              
              <div className="class-info-preview">
                <div className="info-row">
                  <span className="label">수업명:</span>
                  <span className="value">{classToDelete.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">담당 교사:</span>
                  <span className="value">{classToDelete.teacherId}</span>
                </div>
                <div className="info-row">
                  <span className="label">강의실:</span>
                  <span className="value">{classToDelete.classroomId}</span>
                </div>
              </div>
              
              {/* 수업 의존성 정보 표시 */}
              {classDependencies && (
                <div className="class-dependencies-info">
                  <h4>삭제될 관련 데이터:</h4>
                  <div className="dependencies-list">
                    {classDependencies.hasStudentTimetables && (
                      <div className="dependency-item">
                        👥 영향받는 학생: {classDependencies.affectedStudentCount}명
                      </div>
                    )}
                    {classDependencies.hasAttendanceRecords && (
                      <div className="dependency-item">
                        📊 출석 기록: {classDependencies.attendanceCount}개
                      </div>
                    )}
                  </div>
                  <div className="total-impact">
                    <strong>총 {classDependencies.totalRelatedRecords + 1}개의 데이터가 삭제됩니다.</strong>
                  </div>
                </div>
              )}
            </div>
            
            <div className="delete-modal-actions">
              <button 
                className="btn-cancel" 
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                취소
              </button>
              <button 
                className="btn-delete" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 수업 편집 모달 */}
      {isEditModalOpen && classToEdit && (
        <Suspense fallback={<div className="modal-loading">모달 로딩 중...</div>}>
          <EditClassPage
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            classData={classToEdit}
            onClassUpdated={handleClassUpdated}
          />
        </Suspense>
      )}

      {/* 시간 입력 폼 모달 제거 */}
    </BaseWidget>
  )
}

export default ClassPage
