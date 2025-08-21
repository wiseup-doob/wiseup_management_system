import { useCallback, useEffect } from 'react'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { shallowEqual } from 'react-redux' // ✨ shallowEqual import 추가
import { 
  addClass, 
  updateClass, 
  deleteClass, 
  setSelectedClass, 
  setSearchTerm, 
  setFilter,
  fetchClasses,
  fetchClassById,
  searchClasses,
  createClass,
  updateClassAsync,
  deleteClassAsync,
  
  // ===== 시간표 관련 액션들 =====
  setCustomTimeSlots,
  addCustomTimeSlot,
  updateCustomTimeSlot,
  deleteCustomTimeSlot,
  reorderCustomTimeSlots,
  setTimetableGrid,
  toggleTimetableEditMode,
  setSelectedTimeSlot,
  setScheduleStatistics,
  setTimeConflictValidation,
  resetTimetableState,
  
  // ===== 기존 UI 호환성을 위한 액션들 =====
  setTimetableEditMode,
  setTimetableData,
  addTimetableItem,
  updateTimetableItem,
  deleteTimetableItem,
  setTimetableFilters,
  setTimetableSearchTerm,
  sortTimetableItems,
  setTimetablePagination,
  exportTimetableData,
  importTimetableData,
  
  // ===== 사용자 정의 시간대 관리 기능 =====
  setTimeSlots,
  clearTimeSlots,
  duplicateTimeSlot,
  setTimeSlotGroups,
  
  // ===== ClassSection 기반 시간표 Async Thunks =====
  fetchTimetableFromClassSections,
  fetchTimetableGrid,
  validateTimeConflictAsync,
  fetchScheduleStatistics
} from '../slice/classSlice'
import type { Class, ClassFormData, ClassFormDataWithIds } from '../types/class.types'
import type { ClassSection, ClassSchedule } from '@shared/types/class-section.types'
import { apiService } from '../../../services/api'

export const useClass = () => {
  const dispatch = useAppDispatch()
  // ✨ FIX: 전체 객체 선택을 개별 선택으로 변경하여 무한루프 방지
  const classes = useAppSelector(state => state.class.classes)
  const selectedClass = useAppSelector(state => state.class.selectedClass)
  const searchTerm = useAppSelector(state => state.class.searchTerm)
  const isLoading = useAppSelector(state => state.class.isLoading)
  const error = useAppSelector(state => state.class.error)
  
  // filters 객체는 shallowEqual을 사용해 내용이 바뀔 때만 업데이트
  const filters = useAppSelector(state => state.class.filters, shallowEqual)
  
  // ===== 시간표 관련 상태 =====
  const customTimeSlots = useAppSelector(state => state.class.customTimeSlots)
  const timetableGrid = useAppSelector(state => state.class.timetableGrid, shallowEqual)
  const isTimetableEditMode = useAppSelector(state => state.class.isTimetableEditMode)
  const selectedTimeSlot = useAppSelector(state => state.class.selectedTimeSlot)
  const scheduleStatistics = useAppSelector(state => state.class.scheduleStatistics)
  const timeConflictValidation = useAppSelector(state => state.class.timeConflictValidation)

  // 컴포넌트 마운트 시 수업 목록 자동 로드 - 한 번만 실행
  useEffect(() => {
    dispatch(fetchClasses())
  }, []) // dispatch는 안정적인 참조이므로 의존성 배열에서 제거

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

  const handleUpdateClass = useCallback(async (classItem: Class) => {
    try {
      await dispatch(updateClassAsync({ id: classItem.id, classData: classItem })).unwrap()
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('수업 수정 실패:', error)
      throw error
    }
  }, [dispatch])

  // ===== ClassSection 기반 시간표 관리 기능 =====
  
  // ClassSection 스케줄 추가
  const handleAddClassSchedule = useCallback(async (classSectionId: string, schedule: ClassSchedule) => {
    try {
      // 기존 ClassSection 가져오기
      const existingClassSection = await apiService.getClassSectionById(classSectionId)
      
      if (!existingClassSection.data) {
        throw new Error('ClassSection을 찾을 수 없습니다.')
      }
      
      // 기존 스케줄에 새로운 스케줄 추가
      const updatedSchedule = [...(existingClassSection.data.schedule || []), schedule]
      
      // ClassSection 업데이트
      await apiService.updateClassSection(classSectionId, {
        schedule: updatedSchedule
      })
      
      console.log('스케줄 추가 성공:', { classSectionId, schedule })
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('스케줄 추가 실패:', error)
      throw error
    }
  }, [dispatch])

  // ClassSection 스케줄 수정
  const handleUpdateClassSchedule = useCallback(async (classSectionId: string, scheduleId: string, schedule: ClassSchedule) => {
    try {
      // 기존 ClassSection 가져오기
      const existingClassSection = await apiService.getClassSectionById(classSectionId)
      
      if (!existingClassSection.data) {
        throw new Error('ClassSection을 찾을 수 없습니다.')
      }
      
      // 기존 스케줄에서 해당 스케줄 찾아서 수정
      const updatedSchedule = existingClassSection.data.schedule.map(s => {
        // scheduleId는 dayOfWeek-startTime 형태로 생성됨
        const currentScheduleId = `${s.dayOfWeek}-${s.startTime}`
        return currentScheduleId === scheduleId ? schedule : s
      })
      
      // ClassSection 업데이트
      await apiService.updateClassSection(classSectionId, {
        schedule: updatedSchedule
      })
      
      console.log('스케줄 수정 성공:', { classSectionId, scheduleId, schedule })
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('스케줄 수정 실패:', error)
      throw error
    }
  }, [dispatch])

  // ClassSection 스케줄 삭제
  const handleDeleteClassSchedule = useCallback(async (classSectionId: string, scheduleId: string) => {
    try {
      // 기존 ClassSection 가져오기
      const existingClassSection = await apiService.getClassSectionById(classSectionId)
      
      if (!existingClassSection.data) {
        throw new Error('ClassSection을 찾을 수 없습니다.')
      }
      
      // scheduleId에서 dayOfWeek와 startTime 추출
      const [dayOfWeek, startTime] = scheduleId.split('-')
      
      // 해당 스케줄 제거
      const updatedSchedule = existingClassSection.data.schedule.filter(s => 
        !(s.dayOfWeek === dayOfWeek && s.startTime === startTime)
      )
      
      // ClassSection 업데이트
      await apiService.updateClassSection(classSectionId, {
        schedule: updatedSchedule
      })
      
      console.log('스케줄 삭제 성공:', { classSectionId, scheduleId })
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('스케줄 삭제 실패:', error)
      throw error
    }
  }, [dispatch])

  // ClassSection 기반 시간표 데이터 가져오기 - 디바운싱 적용
  const handleFetchClassSchedules = useCallback(async () => {
    try {
      // 이미 로딩 중이면 중복 호출 방지
      if (isLoading) return
      
      // 임시로 빈 배열 반환 (실제 구현 시 API 호출)
      console.log('시간표 데이터 가져오기 시작')
      return []
    } catch (error) {
      console.error('시간표 데이터 가져오기 실패:', error)
      throw error
    }
  }, []) // ✨ FIX: isLoading 의존성 제거로 무한루프 방지

  const handleDeleteClass = useCallback(async (classId: string) => {
    try {
      await dispatch(deleteClassAsync(classId)).unwrap()
      // 성공 시 목록 새로고침
      dispatch(fetchClasses())
    } catch (error) {
      console.error('수업 삭제 실패:', error)
      throw error
    }
  }, [dispatch])

  const handleSelectClass = useCallback((classItem: Class | null) => {
    dispatch(setSelectedClass(classItem))
  }, [dispatch])

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
      if (currentFilters.grade) searchParams.grade = currentFilters.grade
      if (currentFilters.teacherName) searchParams.teacherName = currentFilters.teacherName
      if (currentFilters.status) searchParams.status = currentFilters.status
      
      dispatch(searchClasses(searchParams))
    } else {
      // 활성 필터가 없으면 전체 목록 조회
      dispatch(fetchClasses())
    }
  }, [dispatch, filters])

  // 데이터 새로고침 함수
  const refreshClasses = useCallback(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  // 개별 수업 조회 함수
  const handleFetchClassById = useCallback(async (id: string) => {
    try {
      await dispatch(fetchClassById(id)).unwrap()
    } catch (error) {
      console.error('수업 조회 실패:', error)
      throw error
    }
  }, [dispatch])

  // ===== 시간표 관련 함수들 =====

  // ClassSection 기반 시간표 관리
  const handleFetchTimetableFromClassSections = useCallback(async (params?: {
    dayOfWeek?: string
    startDate?: string
    endDate?: string
  }) => {
    try {
      await dispatch(fetchTimetableFromClassSections(params)).unwrap()
    } catch (error) {
      console.error('ClassSection 기반 시간표 조회 실패:', error)
      throw error
    }
  }, [dispatch])

  // 기존 사용자 정의 시간대 관리 함수들은 더 이상 필요하지 않음
  // ClassSection의 schedule 정보를 기반으로 동적 시간표 생성

  // 시간표 그리드 관리
  const handleFetchTimetableGrid = useCallback(async (params?: {
    dayOfWeek?: string
    startDate?: string
    endDate?: string
  }) => {
    try {
      await dispatch(fetchTimetableGrid(params)).unwrap()
    } catch (error) {
      console.error('시간표 그리드 조회 실패:', error)
      throw error
    }
  }, [dispatch])

  // 시간 충돌 검증
  const handleValidateTimeConflict = useCallback(async (data: {
    classSectionId: string
    dayOfWeek: string
    startTime: string
    endTime: string
    teacherId?: string
    classroomId?: string
  }) => {
    try {
      await dispatch(validateTimeConflictAsync(data)).unwrap()
    } catch (error) {
      console.error('시간 충돌 검증 실패:', error)
      throw error
    }
  }, [dispatch])

  // 시간표 통계 조회
  const handleFetchScheduleStatistics = useCallback(async () => {
    try {
      await dispatch(fetchScheduleStatistics()).unwrap()
    } catch (error) {
      console.error('시간표 통계 조회 실패:', error)
      throw error
    }
  }, [dispatch])

  // 시간표 편집 모드 관리
  const handleToggleTimetableEditMode = useCallback(() => {
    dispatch(toggleTimetableEditMode())
  }, [dispatch])

  const handleSetTimetableEditMode = useCallback((isEditMode: boolean) => {
    dispatch(setTimetableEditMode(isEditMode))
  }, [dispatch])

  // 시간표 데이터 관리
  const handleSetTimetableData = useCallback((data: any) => {
    dispatch(setTimetableData(data))
  }, [dispatch])

  const handleAddTimetableItem = useCallback((item: any) => {
    dispatch(addTimetableItem(item))
  }, [dispatch])

  const handleUpdateTimetableItem = useCallback((item: any) => {
    dispatch(updateTimetableItem(item))
  }, [dispatch])

  const handleDeleteTimetableItem = useCallback((itemId: string) => {
    dispatch(deleteTimetableItem(itemId))
  }, [dispatch])

  // 시간표 필터링 및 검색
  const handleSetTimetableFilters = useCallback((filters: any) => {
    dispatch(setTimetableFilters(filters))
  }, [dispatch])

  const handleSetTimetableSearchTerm = useCallback((searchTerm: string) => {
    dispatch(setTimetableSearchTerm(searchTerm))
  }, [dispatch])

  // 시간표 정렬 (ClassSection 기반)
  const handleSortTimetableItems = useCallback((sortData: {
    field: 'name' | 'courseName' | 'teacherName' | 'schedule'
    direction: 'asc' | 'desc'
  }) => {
    dispatch(sortTimetableItems(sortData))
  }, [dispatch])

  // 시간표 상태 초기화
  const handleResetTimetableState = useCallback(() => {
    dispatch(resetTimetableState())
  }, [dispatch])

  // ===== 동적 시간대 생성 로직 =====

  // 시간 형식 검증
  const validateTimeFormat = useCallback((time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }, [])

  // 시간 비교 (시작 시간 < 종료 시간)
  const validateTimeRange = useCallback((startTime: string, endTime: string): boolean => {
    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      return false
    }
    
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    return start < end
  }, [validateTimeFormat])

  // 시간대 충돌 검사 (같은 요일 내에서)
  const checkTimeConflict = useCallback((newSlot: {
    dayOfWeek: string
    startTime: string
    endTime: string
  }, existingSlots: Array<{
    dayOfWeek: string
    startTime: string
    endTime: string
  }>): boolean => {
    const sameDaySlots = existingSlots.filter(slot => slot.dayOfWeek === newSlot.dayOfWeek)
    
    return sameDaySlots.some(slot => {
      const newStart = new Date(`2000-01-01T${newSlot.startTime}:00`)
      const newEnd = new Date(`2000-01-01T${newSlot.endTime}:00`)
      const existingStart = new Date(`2000-01-01T${slot.startTime}:00`)
      const existingEnd = new Date(`2000-01-01T${slot.endTime}:00`)
      
      // 시간 겹침 검사
      return (newStart < existingEnd && newEnd > existingStart)
    })
  }, [])

  // 자동 색상 생성
  const generateTimeSlotColor = useCallback((index: number): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    return colors[index % colors.length]
  }, [])

  // 시간대 생성 전 검증
  const validateTimeSlotBeforeCreation = useCallback((data: {
    name: string
    startTime: string
    endTime: string
    dayOfWeek: string
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // 필수 필드 검증
    if (!data.name.trim()) {
      errors.push('시간대 이름을 입력해주세요.')
    }
    
    if (!data.dayOfWeek) {
      errors.push('요일을 선택해주세요.')
    }
    
    // 시간 형식 검증
    if (!validateTimeFormat(data.startTime)) {
      errors.push('시작 시간 형식이 올바르지 않습니다. (HH:MM)')
    }
    
    if (!validateTimeFormat(data.endTime)) {
      errors.push('종료 시간 형식이 올바르지 않습니다. (HH:MM)')
    }
    
    // 시간 범위 검증
    if (!validateTimeRange(data.startTime, data.endTime)) {
      errors.push('시작 시간은 종료 시간보다 빨라야 합니다.')
    }
    
    // 시간대 길이 검증 (최소 30분, 최대 4시간)
    const start = new Date(`2000-01-01T${data.startTime}:00`)
    const end = new Date(`2000-01-01T${data.endTime}:00`)
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    
    if (durationMinutes < 30) {
      errors.push('시간대는 최소 30분 이상이어야 합니다.')
    }
    
    if (durationMinutes > 240) {
      errors.push('시간대는 최대 4시간을 초과할 수 없습니다.')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [validateTimeFormat, validateTimeRange])

  // 요일별 시간대 그룹화
  const groupTimeSlotsByDay = useCallback((timeSlots: any[]): Record<string, any[]> => {
    return timeSlots.reduce((groups, slot) => {
      const day = slot.dayOfWeek || '미지정'
      if (!groups[day]) {
        groups[day] = []
      }
      groups[day].push(slot)
      return groups
    }, {} as Record<string, any[]>)
  }, [])

  // 시간대 정렬 (시작 시간 기준)
  const sortTimeSlotsByTime = useCallback((timeSlots: any[]): any[] => {
    return [...timeSlots].sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.startTime}:00`)
      const timeB = new Date(`2000-01-01T${b.startTime}:00`)
      return timeA.getTime() - timeB.getTime()
    })
  }, [])

  // ===== 사용자 정의 시간대 관리 기능 =====

  // 시간대 일괄 설정
  const handleSetTimeSlots = useCallback((timeSlots: Array<{
    id: string
    name: string
    startTime: string
    endTime: string
    color?: string
  }>) => {
    dispatch(setTimeSlots(timeSlots))
  }, [dispatch])

  // 시간대 일괄 삭제
  const handleClearTimeSlots = useCallback(() => {
    dispatch(clearTimeSlots())
  }, [dispatch])

  // 시간대 복사
  const handleDuplicateTimeSlot = useCallback((id: string) => {
    dispatch(duplicateTimeSlot(id))
  }, [dispatch])

  // 시간대 그룹화 설정
  const handleSetTimeSlotGroups = useCallback((groups: Array<{
    dayOfWeek: string
    timeSlots: Array<{
      id: string
      name: string
      startTime: string
      endTime: string
      color?: string
    }>
  }>) => {
    dispatch(setTimeSlotGroups(groups))
  }, [dispatch])

  // 시간대 일괄 검증
  const validateAllTimeSlots = useCallback((timeSlots: Array<{
    name: string
    startTime: string
    endTime: string
    dayOfWeek: string
  }>): { isValid: boolean; errors: string[]; validSlots: any[] } => {
    const errors: string[] = []
    const validSlots: any[] = []

    timeSlots.forEach((slot, index) => {
      const validation = validateTimeSlotBeforeCreation(slot)
      if (validation.isValid) {
        validSlots.push(slot)
      } else {
        errors.push(`시간대 ${index + 1}: ${validation.errors.join(', ')}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      validSlots
    }
  }, [validateTimeSlotBeforeCreation])

  // 시간대 템플릿 적용
  const applyTimeSlotTemplate = useCallback((template: 'standard' | 'custom') => {
    let timeSlots: Array<{
      name: string
      startTime: string
      endTime: string
      color?: string
    }> = []

    if (template === 'standard') {
      // 표준 시간대 템플릿 (9:00-17:00, 1시간 간격)
      timeSlots = [
        { name: '1교시', startTime: '09:00', endTime: '10:00', color: '#FF6B6B' },
        { name: '2교시', startTime: '10:00', endTime: '11:00', color: '#4ECDC4' },
        { name: '3교시', startTime: '11:00', endTime: '12:00', color: '#45B7D1' },
        { name: '점심시간', startTime: '12:00', endTime: '13:00', color: '#96CEB4' },
        { name: '4교시', startTime: '13:00', endTime: '14:00', color: '#FFEAA7' },
        { name: '5교시', startTime: '14:00', endTime: '15:00', color: '#DDA0DD' },
        { name: '6교시', startTime: '15:00', endTime: '16:00', color: '#98D8C8' },
        { name: '7교시', startTime: '16:00', endTime: '17:00', color: '#F7DC6F' }
      ]
    }

    // 템플릿 적용
    if (timeSlots.length > 0) {
      const validatedSlots = timeSlots.map((slot, index) => ({
        ...slot,
        id: `template_${Date.now()}_${index}`,
        dayOfWeek: 'monday' // 기본값, 사용자가 나중에 수정 가능
      }))
      
      handleSetTimeSlots(validatedSlots)
    }
  }, [handleSetTimeSlots])

  return {
    // ===== 기존 수업 관련 상태 및 함수들 =====
    classes,
    selectedClass,
    searchTerm,
    filters,
    isLoading,
    error,
    handleAddClass,
    handleUpdateClass,
    handleDeleteClass,
    handleSelectClass,
    handleSearchChange,
    handleFilterChange,
    refreshClasses,
    handleFetchClassById,
    
    // ===== 시간표 관련 상태 =====
    customTimeSlots,
    timetableGrid,
    isTimetableEditMode,
    selectedTimeSlot,
    scheduleStatistics,
    timeConflictValidation,
    
    // ===== ClassSection 기반 시간표 관련 함수들 =====
    handleFetchTimetableFromClassSections,
    handleFetchTimetableGrid,
    handleValidateTimeConflict,
    handleFetchScheduleStatistics,
    handleToggleTimetableEditMode,
    handleSetTimetableEditMode,
    handleSetTimetableData,
    handleAddTimetableItem,
    handleUpdateTimetableItem,
    handleDeleteTimetableItem,
    handleSetTimetableFilters,
    handleSetTimetableSearchTerm,
    handleSortTimetableItems,
    handleResetTimetableState,
    
    // ===== 동적 시간대 생성 관련 함수들 =====
    validateTimeFormat,
    validateTimeRange,
    checkTimeConflict,
    generateTimeSlotColor,
    validateTimeSlotBeforeCreation,
    groupTimeSlotsByDay,
    sortTimeSlotsByTime,
    
    // ===== 사용자 정의 시간대 관리 기능 =====
    handleSetTimeSlots,
    handleClearTimeSlots,
    handleDuplicateTimeSlot,
    handleSetTimeSlotGroups,
    validateAllTimeSlots,
    applyTimeSlotTemplate,
    
    // ===== ClassSection 기반 시간표 관리 기능 =====
    handleAddClassSchedule,
    handleUpdateClassSchedule,
    handleDeleteClassSchedule,
    handleFetchClassSchedules
  }
}
