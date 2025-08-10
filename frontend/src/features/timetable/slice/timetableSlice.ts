import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { 
  TimetableItem, 
  TimeSlot, 
  Timetable,
  Class,
  Teacher,
  Classroom
} from '@shared/types'
import type { TimetableState, TimetableFilters } from '../types/timetable.types'

const initialState: TimetableState = {
  timeSlots: [],
  timetableItems: [],
  timetables: [],
  classes: [],
  teachers: [],
  classrooms: [],
  selectedTimetable: null,
  selectedItem: null,
  loading: false,
  error: null,
  isEditable: false
}

const timetableSlice = createSlice({
  name: 'timetable',
  initialState,
  reducers: {
    // 로딩 상태 관리
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // 오류 상태 관리
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },

    // 편집 모드 토글
    toggleEditMode: (state) => {
      state.isEditable = !state.isEditable
    },

    // 시간대 데이터 설정
    setTimeSlots: (state, action: PayloadAction<TimeSlot[]>) => {
      state.timeSlots = action.payload
    },

    // 시간표 항목 데이터 설정
    setTimetableItems: (state, action: PayloadAction<TimetableItem[]>) => {
      state.timetableItems = action.payload
    },

    // 시간표 목록 설정
    setTimetables: (state, action: PayloadAction<Timetable[]>) => {
      state.timetables = action.payload
    },

    // 수업 목록 설정
    setClasses: (state, action: PayloadAction<Class[]>) => {
      state.classes = action.payload
    },

    // 교사 목록 설정
    setTeachers: (state, action: PayloadAction<Teacher[]>) => {
      state.teachers = action.payload
    },

    // 강의실 목록 설정
    setClassrooms: (state, action: PayloadAction<Classroom[]>) => {
      state.classrooms = action.payload
    },

    // 선택된 시간표 설정
    setSelectedTimetable: (state, action: PayloadAction<Timetable | null>) => {
      state.selectedTimetable = action.payload
    },

    // 선택된 항목 설정
    setSelectedItem: (state, action: PayloadAction<TimetableItem | null>) => {
      state.selectedItem = action.payload
    },

    // 시간표 항목 추가
    addTimetableItem: (state, action: PayloadAction<TimetableItem>) => {
      state.timetableItems.push(action.payload)
    },

    // 시간표 항목 업데이트
    updateTimetableItem: (state, action: PayloadAction<TimetableItem>) => {
      const index = state.timetableItems.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.timetableItems[index] = action.payload
      }
    },

    // 시간표 항목 삭제
    deleteTimetableItem: (state, action: PayloadAction<string>) => {
      state.timetableItems = state.timetableItems.filter(item => item.id !== action.payload)
    },

    // 시간표 항목 상태 업데이트
    updateTimetableItemStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const item = state.timetableItems.find(item => item.id === action.payload.id)
      if (item) {
        item.status = action.payload.status as any
      }
    },

    // 필터링된 항목 설정
    setFilteredItems: (state, action: PayloadAction<TimetableItem[]>) => {
      state.timetableItems = action.payload
    },

    // 상태 초기화
    resetTimetableState: (state) => {
      state.timeSlots = []
      state.timetableItems = []
      state.timetables = []
      state.classes = []
      state.teachers = []
      state.classrooms = []
      state.selectedTimetable = null
      state.selectedItem = null
      state.loading = false
      state.error = null
      state.isEditable = false
    }
  }
})

export const {
  setLoading,
  setError,
  toggleEditMode,
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
  updateTimetableItemStatus,
  setFilteredItems,
  resetTimetableState
} = timetableSlice.actions

export default timetableSlice.reducer
