import * as functions from 'firebase-functions'
import express from 'express'
import cors from 'cors'
import { errorHandler } from './common/errorHandler'
import studentRoute from './modules/student/student.route'
import authRoute from './modules/auth/auth.route'
import userRoute from './modules/users/user.route'
import timetableRoute from './modules/timetable/timetable.route'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// 도메인별 router mount
app.use('/students', studentRoute)
app.use('/auth', authRoute)       // 🔐 인증 관련 API
app.use('/users', userRoute)      // 👤 사용자 관리 API
app.use('/timetables', timetableRoute) // 📅 시간표 관리 API

app.use(errorHandler)             // ✨ 전역 에러 미들웨어

export const api = functions.https.onRequest(app)