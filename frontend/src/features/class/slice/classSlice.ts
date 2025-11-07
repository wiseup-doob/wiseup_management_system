import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ClassState, ClassFormData, ClassFormDataWithIds } from '../types/class.types'
import type { ClassSection } from '@shared/types/class-section.types'
import { apiService } from '../../../services/api'
import { adaptClassSectionToClass } from '../../../utils/classAdapter'

// ===== 헬퍼 함수들 =====

/**
 * ClassSchedule 배열을 문자열 형태로 변환
 * @param schedules 수업 일정 배열
 * @returns "월,수,금 09:00-10:30" 형태의 문자열
 */
function formatScheduleForDisplay(schedules: any[]): string {
  if (!schedules || schedules.length === 0) {
    return '일정 없음';
  }

  const dayNames: Record<string, string> = {
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일'
  };

  const formattedSchedules = schedules.map(schedule => {
    const dayName = dayNames[schedule.dayOfWeek] || schedule.dayOfWeek;
    return `${dayName} ${schedule.startTime}-${schedule.endTime}`;
  });

  return formattedSchedules.join(', ');
}

/**
 * Firestore Timestamp를 날짜 문자열로 변환
 * @param timestamp Firestore Timestamp
 * @returns "YYYY-MM-DD" 형태의 문자열
 */
function formatDateForDisplay(timestamp: any): string {
  if (!timestamp) return '';
  
  try {
    // Firestore Timestamp인 경우
    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split('T')[0];
    }
    
    // 일반 Date 객체인 경우
    if (timestamp instanceof Date) {
      return timestamp.toISOString().split('T')[0];
    }
    
    // 문자열인 경우 그대로 반환
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    return '';
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return '';
  }
}

// ===== 완전 자유로운 시간 입력 시스템 =====

/**
 * 기본 요일 설정
 */
export const DEFAULT_DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const

/**
 * 시간 형식 검증 헬퍼 함수
 */
export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

/**
 * 시간 비교 헬퍼 함수
 */
export const compareTime = (time1: string, time2: string): number => {
  const [hours1, minutes1] = time1.split(':').map(Number)
  const [hours2, minutes2] = time2.split(':').map(Number)
  
  const totalMinutes1 = hours1 * 60 + minutes1
  const totalMinutes2 = hours2 * 60 + minutes2
  
  return totalMinutes1 - totalMinutes2
}

// ===== Async Thunks =====

// 수업 목록 조회
export const fetchClasses = createAsyncThunk(
  'class/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getClassSectionsWithDetails()
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '수업 목록 조회에 실패했습니다.')
    }
  }
)

// 개별 수업 조회
export const fetchClassById = createAsyncThunk(
  'class/fetchClassById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getClassSectionWithDetailsById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '수업 조회에 실패했습니다.')
    }
  }
)

// 수업 검색
export const searchClasses = createAsyncThunk(
  'class/searchClasses',
  async (searchParams: any, { rejectWithValue }) => {
    try {

      // 검색은 기본 API를 사용하고, 결과를 상세 정보와 함께 조회
      const response = await apiService.searchClassSections(searchParams)
      if (response.data && response.data.length > 0) {
        // 검색된 수업들의 상세 정보를 개별적으로 조회
        const detailedResults = await Promise.all(
          response.data.map(async (section: ClassSection) => {
            try {
              const detailResponse = await apiService.getClassSectionWithDetailsById(section.id)
              return detailResponse.data
            } catch (error) {
              console.warn(`수업 ${section.id} 상세 정보 조회 실패:`, error)
              return section // 기본 정보라도 반환
            }
          })
        )
        return detailedResults
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '수업 검색에 실패했습니다.')
    }
  }
)

// 수업 생성
export const createClass = createAsyncThunk(
  'class/createClass',
  async (classData: ClassFormDataWithIds, { rejectWithValue }) => {
    try {
      // ✅ 실제 데이터 사용 (AddClassPage에서 전달받은 값들)
      const createRequest = {
        name: classData.name,
        courseId: classData.courseId,
        teacherId: classData.teacherId,
        classroomId: classData.classroomId,
        schedule: [],
        maxStudents: classData.maxStudents,
        description: classData.description
      }
      
      const response = await apiService.createClassSection(createRequest)
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '수업 생성에 실패했습니다.')
    }
  }
)

// 수업 수정
export const updateClassAsync = createAsyncThunk(
  'class/updateClassAsync',
  async ({ id, classData }: { id: string; classData: Partial<ClassSection> }, { rejectWithValue }) => {
    try {
      // ✅ 실제 데이터 사용
      const updateRequest = {
        name: classData.name,
        courseId: classData.courseId,
        teacherId: classData.teacherId,
        classroomId: classData.classroomId,
        schedule: classData.schedule || [],
        maxStudents: classData.maxStudents,
        currentStudents: classData.currentStudents,
        status: classData.status,
        description: classData.description
      }
      
      await apiService.updateClassSection(id, updateRequest)
      return { id, ...classData } as ClassSection
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '수업 수정에 실패했습니다.')
    }
  }
)

// 수업 삭제
export const deleteClassAsync = createAsyncThunk(
  'class/deleteClassAsync',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.deleteClassSection(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '수업 삭제에 실패했습니다.')
    }
  }
)

// ===== ClassSection 기반 시간표 Async Thunks =====

// 랜덤 색상 생성 함수 (시간표 렌더링용)
const generateRandomColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// ClassSection의 schedule 정보를 기반으로 시간표 그리드 생성
export const fetchTimetableFromClassSections = createAsyncThunk(
  'class/fetchTimetableFromClassSections',
  async (params: {
    dayOfWeek?: string
    startDate?: string
    endDate?: string
  } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getTimetableFromClassSections(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '시간표 데이터 조회에 실패했습니다.')
    }
  }
)

// 시간표 그리드 조회
export const fetchTimetableGrid = createAsyncThunk(
  'class/fetchTimetableGrid',
  async (params: {
    dayOfWeek?: string
    startDate?: string
    endDate?: string
  } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getTimetableGrid(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '시간표 그리드 조회에 실패했습니다.')
    }
  }
)

// 시간 충돌 검증
export const validateTimeConflictAsync = createAsyncThunk(
  'class/validateTimeConflictAsync',
  async (data: {
    teacherId: string;
    classroomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    excludeId?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.validateTimeConflict(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '시간 충돌 검증에 실패했습니다.')
    }
  }
)

// 시간표 통계 조회
export const fetchScheduleStatistics = createAsyncThunk(
  'class/fetchScheduleStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getScheduleStatistics()
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '시간표 통계 조회에 실패했습니다.')
    }
  }
)

const initialState: ClassState = {
  classes: [],
  selectedClass: null,
  searchTerm: '',
  isLoading: true,  // 초기 로딩 상태를 true로 설정하여 마운트 시 스켈레톤 표시
  error: null,
  filters: {
    teacherName: '',
    status: ''
  },
  
  // ===== 시간표 관련 상태 초기값 =====
  customTimeSlots: [], // 사용자가 자유롭게 추가할 시간대
  timetableGrid: {
    timeSlots: [], // 사용자가 추가한 시간대들
    classes: [], // 수업들
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  isTimetableEditMode: false,
  selectedTimeSlot: null,
  scheduleStatistics: null,
  timeConflictValidation: null
}

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    // 클래스 추가
    addClass: (state, action: PayloadAction<ClassSection>) => {
      state.classes.push(action.payload)
    },
    
    // 클래스 수정
    updateClass: (state, action: PayloadAction<ClassSection>) => {
      const index = state.classes.findIndex((c: ClassSection) => c.id === action.payload.id)
      if (index !== -1) {
        state.classes[index] = action.payload
      }
    },
    
    // 클래스 삭제
    deleteClass: (state, action: PayloadAction<string>) => {
      state.classes = state.classes.filter((c: ClassSection) => c.id !== action.payload)
    },
    
    // 선택된 클래스 설정
    setSelectedClass: (state, action: PayloadAction<ClassSection | null>) => {
      state.selectedClass = action.payload
    },
    
    // 검색어 설정
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    
    // 필터 설정
    setFilter: (state, action: PayloadAction<{ key: keyof ClassState['filters']; value: string }>) => {
      const { key, value } = action.payload
      state.filters[key] = value
    },
    
    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // 에러 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    // ===== 시간표 관련 액션들 =====
    
    // 사용자 정의 시간대 설정
    setCustomTimeSlots: (state, action: PayloadAction<Array<{
      id: string
      name: string
      startTime: string
      endTime: string
      color?: string
    }>>) => {
      state.customTimeSlots = action.payload
    },
    
    // 사용자 정의 시간대 추가
    addCustomTimeSlot: (state, action: PayloadAction<{
      id: string
      name: string
      startTime: string
      endTime: string
      color?: string
    }>) => {
      state.customTimeSlots.push(action.payload)
    },
    
    // 사용자 정의 시간대 수정
    updateCustomTimeSlot: (state, action: PayloadAction<{
      id: string
      name?: string
      startTime?: string
      endTime?: string
      color?: string
    }>) => {
      const index = state.customTimeSlots.findIndex(slot => slot.id === action.payload.id)
      if (index !== -1) {
        state.customTimeSlots[index] = { ...state.customTimeSlots[index], ...action.payload }
      }
    },
    
    // 사용자 정의 시간대 삭제
    deleteCustomTimeSlot: (state, action: PayloadAction<string>) => {
      state.customTimeSlots = state.customTimeSlots.filter(slot => slot.id !== action.payload)
    },
    
    // 사용자 정의 시간대 순서 변경 (인덱스 기반)
    reorderCustomTimeSlots: (state, action: PayloadAction<Array<{ id: string; newIndex: number }>>) => {
      const slots = [...state.customTimeSlots]
      action.payload.forEach(({ id, newIndex }) => {
        const currentIndex = slots.findIndex(slot => slot.id === id)
        if (currentIndex !== -1 && newIndex >= 0 && newIndex < slots.length) {
          const [movedSlot] = slots.splice(currentIndex, 1)
          slots.splice(newIndex, 0, movedSlot)
        }
      })
      state.customTimeSlots = slots
    },
    
    // 시간표 그리드 설정 (ClassSection 기반)
    setTimetableGrid: (state, action: PayloadAction<{
      timeSlots: Array<{
        startTime: string
        endTime: string
      }>
      classes: Array<{
        id: string
        name: string
        courseName: string
        teacherName: string
        classroomName: string
        schedule: Array<{
          dayOfWeek: string
          startTime: string
          endTime: string
        }>
      }>
      daysOfWeek: string[]
    }>) => {
      state.timetableGrid = action.payload
    },
    
    // 시간표 편집 모드 토글
    toggleTimetableEditMode: (state) => {
      state.isTimetableEditMode = !state.isTimetableEditMode
    },
    
    // 선택된 시간대 설정
    setSelectedTimeSlot: (state, action: PayloadAction<{
      id: string
      name: string
      startTime: string
      endTime: string
      order: number
      isBreak: boolean
      color?: string
    } | null>) => {
      state.selectedTimeSlot = action.payload
    },
    
    // 시간표 통계 설정
    setScheduleStatistics: (state, action: PayloadAction<{
      totalClasses: number
      classesByDay: Record<string, number>
      classesByTime: Record<string, number>
      conflicts: number
      totalHours: number
      averageClassDuration: number
    }>) => {
      state.scheduleStatistics = action.payload
    },
    
    // 시간 충돌 검증 결과 설정
    setTimeConflictValidation: (state, action: PayloadAction<{
      hasConflict: boolean
      conflicts: Array<{
        classSectionId: string
        className: string
        dayOfWeek: string
        startTime: string
        endTime: string
        conflictType: 'teacher' | 'classroom' | 'student'
        conflictDetails: string
      }>
    }>) => {
      state.timeConflictValidation = action.payload
    },
    
    // 시간표 상태 초기화
    resetTimetableState: (state) => {
      state.customTimeSlots = [] // 빈 상태로 초기화
      state.timetableGrid = {
        timeSlots: [], // 빈 시간대
        classes: [], // 빈 수업 목록
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }
      state.isTimetableEditMode = false
      state.selectedTimeSlot = null
      state.scheduleStatistics = null
      state.timeConflictValidation = null
    },
    
    // 시간대 추가 (사용자가 자유롭게 시간 입력)
    addTimeSlot: (state, action: PayloadAction<{
      id: string
      name: string
      startTime: string
      endTime: string
      color?: string
    }>) => {
      const newTimeSlot = {
        ...action.payload,
        color: action.payload.color || generateRandomColor()
      }
      state.customTimeSlots.push(newTimeSlot)
      
      // timetableGrid도 동기화 (id, name, color 제거)
      if (state.timetableGrid) {
        state.timetableGrid.timeSlots.push({
          startTime: newTimeSlot.startTime,
          endTime: newTimeSlot.endTime
        })
      }
    },
    
    // 시간대 수정
    updateTimeSlot: (state, action: PayloadAction<{
      id: string
      name?: string
      startTime?: string
      endTime?: string
      color?: string
    }>) => {
      const index = state.customTimeSlots.findIndex(slot => slot.id === action.payload.id)
      if (index !== -1) {
        state.customTimeSlots[index] = { ...state.customTimeSlots[index], ...action.payload }
        
        // timetableGrid도 동기화 (startTime, endTime만)
        if (state.timetableGrid && (action.payload.startTime || action.payload.endTime)) {
          const gridIndex = state.customTimeSlots.findIndex(slot => slot.id === action.payload.id)
          if (gridIndex !== -1) {
            const updatedSlot = state.customTimeSlots[gridIndex]
            state.timetableGrid.timeSlots[gridIndex] = {
              startTime: updatedSlot.startTime,
              endTime: updatedSlot.endTime
            }
          }
        }
      }
    },
    
    // 시간대 삭제
    deleteTimeSlot: (state, action: PayloadAction<string>) => {
      state.customTimeSlots = state.customTimeSlots.filter(slot => slot.id !== action.payload)
      
      // timetableGrid도 동기화
      if (state.timetableGrid) {
        state.timetableGrid.timeSlots = state.customTimeSlots.filter(slot => slot.id !== action.payload)
      }
    },
    
    // ===== 기존 UI 호환성을 위한 추가 액션들 =====
    
    // 시간표 편집 모드 설정 (기존 UI 호환)
    setTimetableEditMode: (state, action: PayloadAction<boolean>) => {
      state.isTimetableEditMode = action.payload
    },
    
    // 시간표 데이터 일괄 설정 (ClassSection 기반)
    setTimetableData: (state, action: PayloadAction<{
      timeSlots: Array<{
        startTime: string
        endTime: string
      }>
      classes: Array<{
        id: string
        name: string
        courseName: string
        teacherName: string
        classroomName: string
        schedule: Array<{
          dayOfWeek: string
          startTime: string
          endTime: string
        }>
      }>
      daysOfWeek: string[]
    }>) => {
      state.timetableGrid = action.payload
    },
    
    // 시간표 항목 추가 (ClassSection 기반)
    addTimetableItem: (state, action: PayloadAction<{
      id: string
      name: string
      courseName: string
      teacherName: string
      classroomName: string
      schedule: Array<{
        dayOfWeek: string
        startTime: string
        endTime: string
      }>
    }>) => {
      if (state.timetableGrid) {
        state.timetableGrid.classes.push(action.payload)
      }
    },
    
    // 시간표 항목 수정 (기존 UI 호환)
    updateTimetableItem: (state, action: PayloadAction<{
      id: string
      name?: string
      courseName?: string
      teacherName?: string
      classroomName?: string
      dayOfWeek?: string
      startTime?: string
      endTime?: string
      color?: string
    }>) => {
      if (state.timetableGrid) {
        const index = state.timetableGrid.classes.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.timetableGrid.classes[index] = { ...state.timetableGrid.classes[index], ...action.payload }
        }
      }
    },
    
    // 시간표 항목 삭제 (기존 UI 호환)
    deleteTimetableItem: (state, action: PayloadAction<string>) => {
      if (state.timetableGrid) {
        state.timetableGrid.classes = state.timetableGrid.classes.filter(item => item.id !== action.payload)
      }
    },
    
    // 시간표 필터링 (기존 UI 호환)
    setTimetableFilters: (state, action: PayloadAction<{
      dayOfWeek?: string
      startTime?: string
      endTime?: string
      teacherId?: string
      courseId?: string
      classroomId?: string
    }>) => {
      // 필터링은 컴포넌트에서 처리하므로 상태만 저장
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // 시간표 검색 (기존 UI 호환)
    setTimetableSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    
    // 시간표 정렬 (ClassSection 기반)
    sortTimetableItems: (state, action: PayloadAction<{
      field: 'name' | 'courseName' | 'teacherName' | 'schedule'
      direction: 'asc' | 'desc'
    }>) => {
      if (state.timetableGrid) {
        const { field, direction } = action.payload
        state.timetableGrid.classes.sort((a, b) => {
          let aValue: string
          let bValue: string
          
          if (field === 'schedule') {
            // schedule의 첫 번째 항목의 dayOfWeek로 정렬
            aValue = a.schedule[0]?.dayOfWeek || ''
            bValue = b.schedule[0]?.dayOfWeek || ''
          } else {
            aValue = a[field] || ''
            bValue = b[field] || ''
          }
          
          if (direction === 'asc') {
            return aValue.localeCompare(bValue)
          } else {
            return bValue.localeCompare(aValue)
          }
        })
      }
    },
    
    // 시간표 페이지네이션 (기존 UI 호환)
    setTimetablePagination: (state, action: PayloadAction<{
      currentPage: number
      itemsPerPage: number
      totalItems: number
    }>) => {
      // 페이지네이션 정보는 컴포넌트에서 처리하므로 상태만 저장
      // 필요한 경우 pagination 상태를 추가할 수 있음
    },
    
    // 시간표 내보내기/가져오기 (기존 UI 호환)
    exportTimetableData: (state) => {
      // 내보내기 로직은 컴포넌트에서 처리
      console.log('시간표 데이터 내보내기:', state.timetableGrid)
    },
    
    importTimetableData: (state, action: PayloadAction<{
      timeSlots: Array<{
        startTime: string
        endTime: string
      }>
      classes: Array<{
        id: string
        name: string
        courseName: string
        teacherName: string
        classroomName: string
        schedule: Array<{
          dayOfWeek: string
          startTime: string
          endTime: string
        }>
      }>
      daysOfWeek: string[]
    }>) => {
      state.timetableGrid = action.payload
    },

    // ===== 사용자 정의 시간대 관리 기능 =====

    // 시간대 일괄 설정
    setTimeSlots: (state, action: PayloadAction<Array<{
      id: string
      name: string
      startTime: string
      endTime: string
      color?: string
    }>>) => {
      state.customTimeSlots = action.payload
      // timetableGrid도 동기화
      if (state.timetableGrid) {
        state.timetableGrid.timeSlots = action.payload
      }
    },

    // 시간대 일괄 삭제
    clearTimeSlots: (state) => {
      state.customTimeSlots = []
      // timetableGrid도 동기화
      if (state.timetableGrid) {
        state.timetableGrid.timeSlots = []
      }
    },

    // 시간대 복사
    duplicateTimeSlot: (state, action: PayloadAction<string>) => {
      const originalSlot = state.customTimeSlots.find(slot => slot.id === action.payload)
      if (originalSlot) {
        const newSlot = {
          ...originalSlot,
          id: `duplicate_${Date.now()}`,
          name: `${originalSlot.name} (복사본)`,
          color: generateRandomColor()
        }
        state.customTimeSlots.push(newSlot)
        // timetableGrid도 동기화
        if (state.timetableGrid) {
          state.timetableGrid.timeSlots.push(newSlot)
        }
      }
    },

    // 시간대 그룹화 설정
    setTimeSlotGroups: (state, action: PayloadAction<{
      dayOfWeek: string
      timeSlots: Array<{
        id: string
        name: string
        startTime: string
        endTime: string
        color?: string
      }>
    }[]>) => {
      // 요일별로 시간대를 그룹화하여 설정
      const allTimeSlots = action.payload.flatMap(group => group.timeSlots)
      state.customTimeSlots = allTimeSlots
      // timetableGrid도 동기화
      if (state.timetableGrid) {
        state.timetableGrid.timeSlots = allTimeSlots
      }
    }
  },
  extraReducers: (builder) => {
    // fetchClasses
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ ClassSection 타입을 그대로 사용 (변환 제거)
        if (action.payload) {
          try {
            state.classes = action.payload;
          } catch (error) {
            console.error('데이터 처리 오류:', error);
            state.classes = [];
          }
        }
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchClassById
    builder
      .addCase(fetchClassById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ ClassSection 타입을 그대로 사용 (변환 제거)
        if (action.payload) {
          try {
            state.selectedClass = action.payload;
          } catch (error) {
            console.error('데이터 처리 오류:', error);
            state.selectedClass = null;
          }
        }
      })
      .addCase(fetchClassById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // searchClasses
    builder
      .addCase(searchClasses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchClasses.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ ClassSection 타입을 그대로 사용 (변환 제거)
        if (action.payload) {
          try {
            state.classes = action.payload;
          } catch (error) {
            console.error('데이터 처리 오류:', error);
            state.classes = [];
          }
        }
      })
      .addCase(searchClasses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createClass
    builder
      .addCase(createClass.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ ClassSection 타입을 그대로 사용 (변환 제거)
        if (action.payload) {
          try {
            state.classes.push(action.payload);
          } catch (error) {
            console.error('데이터 처리 오류:', error);
          }
        }
      })
      .addCase(createClass.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateClassAsync
    builder
      .addCase(updateClassAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClassAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ ClassSection 타입을 그대로 사용 (변환 제거)
        const classSection = action.payload as ClassSection;
        const index = state.classes.findIndex((c: ClassSection) => c.id === classSection.id);
        if (index !== -1) {
          state.classes[index] = { ...state.classes[index], ...classSection };
        }
        if (state.selectedClass?.id === classSection.id) {
          state.selectedClass = { ...state.selectedClass, ...classSection };
        }
      })
      .addCase(updateClassAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // deleteClassAsync
    builder
      .addCase(deleteClassAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClassAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classes = state.classes.filter((c: ClassSection) => c.id !== action.payload);
        if (state.selectedClass?.id === action.payload) {
          state.selectedClass = null;
        }
      })
      .addCase(deleteClassAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ===== ClassSection 기반 시간표 Async Thunks 처리 =====

    // fetchTimetableFromClassSections
    builder
      .addCase(fetchTimetableFromClassSections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimetableFromClassSections.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // ClassSection[]을 받아서 timetableGrid 형식으로 변환
          const classSections = action.payload as ClassSection[];
          
          // 시간대 추출
          const timeSlots: Array<{ startTime: string; endTime: string }> = [];
          classSections.forEach(section => {
            section.schedule.forEach(schedule => {
              timeSlots.push({
                startTime: schedule.startTime,
                endTime: schedule.endTime
              });
            });
          });
          
          // 중복 제거
          const uniqueTimeSlots = timeSlots.filter((slot, index, self) => 
            index === self.findIndex(s => s.startTime === slot.startTime && s.endTime === slot.endTime)
          );
          
          state.timetableGrid = {
            timeSlots: uniqueTimeSlots,
            classes: classSections.map(section => ({
              id: section.id,
              name: section.name,
              courseName: '미정', // TODO: courseId로 course 정보를 가져와야 함
              teacherName: section.teacherId, // teacherId를 사용
              classroomName: section.classroomId, // classroomId를 사용
              schedule: section.schedule
            })),
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          };
          
          // 시간대별로 고유한 색상 할당
          if (uniqueTimeSlots.length > 0) {
            state.customTimeSlots = uniqueTimeSlots.map((slot, index) => ({
              id: `time_${index}`,
              name: `${slot.startTime}-${slot.endTime}`,
              startTime: slot.startTime,
              endTime: slot.endTime,
              color: generateRandomColor()
            }));
          }
        }
      })
      .addCase(fetchTimetableFromClassSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchTimetableGrid
    builder
      .addCase(fetchTimetableGrid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimetableGrid.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // ClassSection[]을 받아서 timetableGrid 형식으로 변환 (fetchTimetableFromClassSections와 동일한 로직)
          const classSections = action.payload as ClassSection[];
          
          // 시간대 추출
          const timeSlots: Array<{ startTime: string; endTime: string }> = [];
          classSections.forEach(section => {
            section.schedule.forEach(schedule => {
              timeSlots.push({
                startTime: schedule.startTime,
                endTime: schedule.endTime
              });
            });
          });
          
          // 중복 제거
          const uniqueTimeSlots = timeSlots.filter((slot, index, self) => 
            index === self.findIndex(s => s.startTime === slot.startTime && s.endTime === slot.endTime)
          );
          
          state.timetableGrid = {
            timeSlots: uniqueTimeSlots,
            classes: classSections.map(section => ({
              id: section.id,
              name: section.name,
              courseName: '미정', // TODO: courseId로 course 정보를 가져와야 함
              teacherName: section.teacherId, // teacherId를 사용
              classroomName: section.classroomId, // classroomId를 사용
              schedule: section.schedule
            })),
            daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          };
        }
      })
      .addCase(fetchTimetableGrid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // validateTimeConflictAsync
    builder
      .addCase(validateTimeConflictAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateTimeConflictAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // 백엔드 응답을 프론트엔드 타입으로 변환
          const conflicts: Array<{
            classSectionId: string;
            className: string;
            dayOfWeek: string;
            startTime: string;
            endTime: string;
            conflictType: 'teacher' | 'classroom' | 'student';
            conflictDetails: string;
          }> = []; // 백엔드에서 conflicts를 제공하지 않으므로 빈 배열
          
          state.timeConflictValidation = {
            hasConflict: action.payload.hasConflict,
            conflicts
          };
        }
      })
      .addCase(validateTimeConflictAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchScheduleStatistics
    builder
      .addCase(fetchScheduleStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScheduleStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // 백엔드 응답을 프론트엔드 타입으로 변환
          state.scheduleStatistics = {
            totalClasses: action.payload.totalClasses,
            classesByDay: action.payload.classesByDay,
            classesByTime: action.payload.classesByTime,
            conflicts: 0, // 백엔드에서 conflicts를 제공하지 않으므로 기본값
            totalHours: 0, // 기본값 설정
            averageClassDuration: 0 // 기본값 설정
          };
        }
      })
      .addCase(fetchScheduleStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
})

export const {
  addClass,
  updateClass,
  deleteClass,
  setSelectedClass,
  setSearchTerm,
  setFilter,
  setLoading,
  setError,
  
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
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  
  // ===== 기존 UI 호환성을 위한 추가 액션들 =====
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
  setTimeSlotGroups
} = classSlice.actions



export default classSlice.reducer
