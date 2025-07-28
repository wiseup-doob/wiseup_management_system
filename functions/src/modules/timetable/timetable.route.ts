import { Router } from 'express'
import * as controller from './timetable.controller'
import { asyncWrap } from '../../common/asyncWrap'
import { validate, validateQuery } from '../../common/validator'
import { 
  StudentTimetableSchema, 
  PartialTimetableSchema, 
  TimetableFilterSchema
} from './timetable.validator'

const router = Router()

/**
 * @route GET /timetables
 * @desc Get all timetables
 * @access Public
 */
router.get('/', asyncWrap(controller.list))

/**
 * @route GET /timetables/:id
 * @desc Get timetable by student ID
 * @access Public
 */
router.get('/:id', asyncWrap(controller.detail))

/**
 * @route GET /timetables/:id/entries
 * @desc Get filtered timetable entries
 * @access Public
 * @query {string} date - Specific date (YYYY-MM-DD)
 * @query {string} dateRange.from - Date range start (YYYY-MM-DD)
 * @query {string} dateRange.to - Date range end (YYYY-MM-DD)
 * @query {string} weekday - Specific weekday
 * @query {string} semester - Specific semester
 * @query {boolean} isActive - Active status filter
 * @example
 *   GET /timetables/:id/entries?date=2024-01-15              // Today's schedule
 *   GET /timetables/:id/entries?dateRange.from=2024-01-15&dateRange.to=2024-01-21  // Weekly schedule
 *   GET /timetables/:id/entries?weekday=Mon&isActive=true    // Monday classes only
 */
router.get(
  '/:id/entries', 
  validateQuery(TimetableFilterSchema.omit({ studentId: true })), // studentId는 params에서 가져옴
  asyncWrap(controller.getByFilter)
)

/**
 * @route POST /timetables/:id
 * @desc Create or replace timetable for student
 * @access Public
 * @param {string} id - Student ID
 * @body {StudentTimetable} - Timetable data
 */
router.post(
  '/:id', 
  validate(StudentTimetableSchema.omit({ studentId: true })), // studentId는 params에서 가져옴
  asyncWrap(controller.create)
)

/**
 * @route PUT /timetables/:id
 * @desc Update timetable for student
 * @access Public
 * @param {string} id - Student ID
 * @body {Partial<StudentTimetable>} - Partial timetable data
 */
router.put(
  '/:id',
  validate(PartialTimetableSchema.omit({ studentId: true })),
  asyncWrap(controller.update)
)

/**
 * @route DELETE /timetables/:id
 * @desc Delete timetable for student
 * @access Public
 * @param {string} id - Student ID
 */
router.delete('/:id', asyncWrap(controller.remove))

export default router
