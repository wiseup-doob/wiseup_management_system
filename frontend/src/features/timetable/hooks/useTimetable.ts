import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { timetableService } from '../../../services/timetableService'
import {
  setLoading,
  setError,
  setTimeSlots,
  setTimetableItems,
  setTimetables,
  setClasses,
  setTeachers,
  setClassrooms,
  setSelectedTimetable,
  setSelectedItem,
  addTimetableItem,
  updateTimetableItem,
  deleteTimetableItem,
  toggleEditMode
} from '../slice/timetableSlice'
import type { TimetableItem, TimeSlot, DayOfWeek } from '@shared/types'
import type { TimetableFilters } from '../types/timetable.types'

export const useTimetable = () => {
  const dispatch = useDispatch()
  const timetableState = useSelector((state: any) => state.timetable)

  // 시간표 데이터 로드
  const loadTimetableData = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      dispatch(setError(null))

      console.log('시간표 데이터 로드 시작...')

      // 시간대 데이터 로드
      console.log('시간대 데이터 로드 중...')
      const timeSlotsResponse = await timetableService.getAllTimeSlots()
      console.log('시간대 데이터 응답:', timeSlotsResponse)
      if (timeSlotsResponse.success && timeSlotsResponse.data) {
        dispatch(setTimeSlots(timeSlotsResponse.data))
        console.log('시간대 데이터 설정 완료:', timeSlotsResponse.data.length, '개')
      } else {
        console.warn('시간대 데이터 로드 실패:', timeSlotsResponse)
      }

      // 시간표 목록 로드
      console.log('시간표 목록 로드 중...')
      const timetablesResponse = await timetableService.getAllTimetables()
      console.log('시간표 목록 응답:', timetablesResponse)
      if (timetablesResponse.success && timetablesResponse.data) {
        dispatch(setTimetables(timetablesResponse.data))
        console.log('시간표 목록 설정 완료:', timetablesResponse.data.length, '개')
        
        // 첫 번째 시간표 선택
        if (timetablesResponse.data.length > 0) {
          const firstTimetable = timetablesResponse.data[0]
          dispatch(setSelectedTimetable(firstTimetable))
          console.log('첫 번째 시간표 선택:', firstTimetable.id)
          
          // 선택된 시간표의 항목들 로드
          console.log('시간표 항목 로드 중...')
          const itemsResponse = await timetableService.getTimetableItems(firstTimetable.id)
          console.log('시간표 항목 응답:', itemsResponse)
          if (itemsResponse.success && itemsResponse.data) {
            dispatch(setTimetableItems(itemsResponse.data))
            console.log('시간표 항목 설정 완료:', itemsResponse.data.length, '개')
          } else {
            console.warn('시간표 항목 로드 실패:', itemsResponse)
          }
        } else {
          console.warn('시간표가 없습니다.')
        }
      } else {
        console.warn('시간표 목록 로드 실패:', timetablesResponse)
      }

      // 수업 목록 로드
      console.log('수업 목록 로드 중...')
      const classesResponse = await timetableService.getAllClasses()
      console.log('수업 목록 응답:', classesResponse)
      if (classesResponse.success && classesResponse.data) {
        dispatch(setClasses(classesResponse.data))
        console.log('수업 목록 설정 완료:', classesResponse.data.length, '개')
      } else {
        console.warn('수업 목록 로드 실패:', classesResponse)
      }

      // 교사 목록 로드
      console.log('교사 목록 로드 중...')
      const teachersResponse = await timetableService.getAllTeachers()
      console.log('교사 목록 응답:', teachersResponse)
      if (teachersResponse.success && teachersResponse.data) {
        dispatch(setTeachers(teachersResponse.data))
        console.log('교사 목록 설정 완료:', teachersResponse.data.length, '개')
      } else {
        console.warn('교사 목록 로드 실패:', teachersResponse)
      }

      // 강의실 목록 로드
      console.log('강의실 목록 로드 중...')
      const classroomsResponse = await timetableService.getAllClassrooms()
      console.log('강의실 목록 응답:', classroomsResponse)
      if (classroomsResponse.success && classroomsResponse.data) {
        dispatch(setClassrooms(classroomsResponse.data))
        console.log('강의실 목록 설정 완료:', classroomsResponse.data.length, '개')
      } else {
        console.warn('강의실 목록 로드 실패:', classroomsResponse)
      }
    } catch (error) {
      console.error('시간표 데이터 로드 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '시간표 데이터를 불러오는데 실패했습니다.'
      dispatch(setError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  // 학생별 시간표 데이터 로드(항목만 교체)
  const loadStudentTimetableData = useCallback(async (studentId: string, _params?: { from?: string; to?: string; dayOfWeek?: string }) => {
    try {
      dispatch(setLoading(true))
      dispatch(setError(null))

      // 마스터 데이터가 비어 있으면 로드(항목은 학생별 API로 교체 예정)
      if (!timetableState.timeSlots?.length) {
        const timeSlotsResponse = await timetableService.getAllTimeSlots()
        if (timeSlotsResponse.success && timeSlotsResponse.data) dispatch(setTimeSlots(timeSlotsResponse.data))
      }
      if (!timetableState.classes?.length) {
        const classesResponse = await timetableService.getAllClasses()
        if (classesResponse.success && classesResponse.data) dispatch(setClasses(classesResponse.data))
      }
      if (!timetableState.teachers?.length) {
        const teachersResponse = await timetableService.getAllTeachers()
        if (teachersResponse.success && teachersResponse.data) dispatch(setTeachers(teachersResponse.data))
      }
      if (!timetableState.classrooms?.length) {
        const classroomsResponse = await timetableService.getAllClassrooms()
        if (classroomsResponse.success && classroomsResponse.data) dispatch(setClassrooms(classroomsResponse.data))
      }

      // 학생의 개인 시간표 보장 후, 해당 시간표의 항목 로드
      const ensure = await timetableService.ensureStudentTimetable(studentId)
      const timetableId = ensure.success && ensure.data ? (ensure.data as any).id : null
      if (timetableId) {
        const itemsResponse = await timetableService.getTimetableItems(timetableId)
        if (itemsResponse.success && itemsResponse.data) {
          dispatch(setSelectedTimetable(ensure.data as any))
          dispatch(setTimetableItems(itemsResponse.data))
          try {
            ;(document as any).__selectedTimetableId = timetableId
          } catch {}
        } else {
          dispatch(setTimetableItems([] as any))
        }
      } else {
        dispatch(setTimetableItems([] as any))
      }
    } catch (error) {
      console.error('학생별 시간표 데이터 로드 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '학생별 시간표 데이터를 불러오는데 실패했습니다.'
      dispatch(setError(errorMessage))
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, timetableState.timeSlots?.length, timetableState.classes?.length, timetableState.teachers?.length, timetableState.classrooms?.length])

  // 시간표 항목 삭제
  const deleteItem = useCallback(async (itemId: string) => {
    try {
      const response = await timetableService.deleteTimetableItem(itemId)
      if (response.success) {
        dispatch(deleteTimetableItem(itemId))
      } else {
        throw new Error('삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간표 항목 삭제 오류:', error)
      dispatch(setError('삭제 중 오류가 발생했습니다.'))
    }
  }, [dispatch])

  // 시간표 항목 업데이트
  const updateItem = useCallback(async (itemId: string, data: Partial<TimetableItem>) => {
    try {
      const response = await timetableService.updateTimetableItem(itemId, data)
      if (response.success && response.data) {
        dispatch(updateTimetableItem(response.data))
      } else {
        throw new Error('업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간표 항목 업데이트 오류:', error)
      dispatch(setError('업데이트 중 오류가 발생했습니다.'))
    }
  }, [dispatch])

  // 시간표 항목 추가
  const addItem = useCallback(async (data: any) => {
    try {
      const response = await timetableService.createTimetableItem(data)
      if (response.success && response.data) {
        dispatch(addTimetableItem(response.data))
      } else {
        throw new Error('추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('시간표 항목 추가 오류:', error)
      dispatch(setError('추가 중 오류가 발생했습니다.'))
    }
  }, [dispatch])

  // 선택된 항목 설정
  const selectItem = useCallback((item: TimetableItem | null) => {
    dispatch(setSelectedItem(item))
  }, [dispatch])

  // 편집 모드 토글
  const toggleEdit = useCallback(() => {
    dispatch(toggleEditMode())
  }, [dispatch])

  // 필터링
  const filterItems = useCallback((filters: TimetableFilters) => {
    let filteredItems = [...timetableState.timetableItems]

    if (filters.searchTerm) {
      filteredItems = filteredItems.filter(item => 
        item.classId.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      )
    }

    if (filters.dayOfWeek) {
      filteredItems = filteredItems.filter(item => 
        item.dayOfWeek === filters.dayOfWeek
      )
    }

    if (filters.subject) {
      // 수업 정보에서 과목 필터링 (실제 구현에서는 수업 정보와 연결 필요)
      filteredItems = filteredItems.filter(item => {
        const classInfo = timetableState.classes.find((c: any) => c.id === item.classId)
        return classInfo?.subject === filters.subject
      })
    }

    if (filters.teacherId) {
      filteredItems = filteredItems.filter(item => 
        item.teacherId === filters.teacherId
      )
    }

    return filteredItems
  }, [timetableState.timetableItems, timetableState.classes])

  return {
    // 상태
    ...timetableState,
    
    // 액션
    loadTimetableData,
    loadStudentTimetableData,
    deleteItem,
    updateItem,
    addItem,
    selectItem,
    toggleEdit,
    filterItems
  }
}
