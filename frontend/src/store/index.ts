import { configureStore } from '@reduxjs/toolkit'
import attendanceReducer from '../features/attendance/slice/attendanceSlice'
import studentsReducer from '../features/students/slice/studentsSlice'
import gradesReducer from '../features/grades/slice/gradesSlice'
import authReducer from '../features/auth/slice/authSlice'
import uiReducer from './slices/uiSlice'

import classReducer from '../features/class/slice/classSlice'

export const store = configureStore({
  reducer: {
    attendance: attendanceReducer,
    students: studentsReducer,
    grades: gradesReducer,
    auth: authReducer,
    ui: uiReducer,

    class: classReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 