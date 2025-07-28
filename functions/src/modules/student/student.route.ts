import { Router } from 'express'
import { asyncWrap } from '../../common/asyncWrap'
import { validate, validateQuery } from '../../common/validator'
import { StudentSchema, StudentFilterSchema } from './student.validator'
import * as ctrl from './student.controller'

const router = Router()

/**
 * @route GET /students/search
 * @desc Search students by filter
 * @access Public
 * @query {StudentFilter} - Search filters (user_id, name, school, grade)
 */
router.get('/search', validateQuery(StudentFilterSchema), asyncWrap(ctrl.searchStudents))

/**
 * @route GET /students/user/:user_id
 * @desc Get student by user_id
 * @access Public
 */
router.get('/user/:user_id', asyncWrap(ctrl.getByUserId))

/**
 * @route GET /students
 * @desc Get all students
 * @access Public
 */
router.get('/', asyncWrap(ctrl.list))

/**
 * @route GET /students/:id
 * @desc Get student by ID
 * @access Public
 */
router.get('/:id', asyncWrap(ctrl.detail))

/**
 * @route POST /students/:id
 * @desc Create new student
 * @access Public
 * @body {Student} - Student data
 */
router.post('/:id', validate(StudentSchema), asyncWrap(ctrl.create))

/**
 * @route PUT /students/:id
 * @desc Update student
 * @access Public
 * @body {Partial<Student>} - Updated student data
 */
router.put('/:id', validate(StudentSchema.partial()), asyncWrap(ctrl.update))

/**
 * @route DELETE /students/:id
 * @desc Delete student
 * @access Public
 */
router.delete('/:id', asyncWrap(ctrl.remove))

export default router