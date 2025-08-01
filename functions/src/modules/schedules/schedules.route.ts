import express from 'express';
import { asyncWrap } from '../../common/asyncWrap';
import { validate } from '../../common/validator';
import {
  CreateScheduleSchema,
  UpdateScheduleSchema,
  ScheduleFilterSchema,
  ScheduleIdSchema,
  ScheduleStatsFilterSchema,
  DailyScheduleSummarySchema,
  StudentScheduleSummarySchema,
  ClassScheduleSummarySchema,
} from './schedules.validator';
import {
  createScheduleController,
  getScheduleController,
  getSchedulesController,
  updateScheduleController,
  deleteScheduleController,
  getScheduleWithDetailsController,
  getScheduleStatsController,
  getDailyScheduleSummaryController,
  getStudentScheduleSummaryController,
  getClassScheduleSummaryController,
  getSchedulesWithDetailsBatchController,
  getScheduleStatsBatchController,
} from './schedules.controller';

const router = express.Router();

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: 일정 생성
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScheduleRequest'
 *     responses:
 *       201:
 *         description: 일정 생성 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/', validate(CreateScheduleSchema), asyncWrap(createScheduleController));

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: 일정 목록 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 일정 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/', validate(ScheduleFilterSchema), asyncWrap(getSchedulesController));

/**
 * @swagger
 * /schedules/stats:
 *   get:
 *     summary: 일정 통계 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 일정 통계 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/stats', validate(ScheduleStatsFilterSchema), asyncWrap(getScheduleStatsController));

/**
 * @swagger
 * /schedules/daily/{date}:
 *   get:
 *     summary: 일별 일정 요약 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 일별 일정 요약 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/daily/:date', validate(DailyScheduleSummarySchema), asyncWrap(getDailyScheduleSummaryController));

/**
 * @swagger
 * /schedules/student/{student_id}/summary:
 *   get:
 *     summary: 학생별 일정 요약 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 학생별 일정 요약 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/student/:student_id/summary', validate(StudentScheduleSummarySchema), asyncWrap(getStudentScheduleSummaryController));

/**
 * @swagger
 * /schedules/class/{class_id}/summary:
 *   get:
 *     summary: 반별 일정 요약 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 반별 일정 요약 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/class/:class_id/summary', validate(ClassScheduleSummarySchema), asyncWrap(getClassScheduleSummaryController));

/**
 * @swagger
 * /schedules/batch/details:
 *   post:
 *     summary: 배치 일정 상세 정보 조회
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 배치 일정 상세 정보 조회 성공
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/batch/details', asyncWrap(getSchedulesWithDetailsBatchController));

/**
 * @swagger
 * /schedules/batch/stats:
 *   get:
 *     summary: 배치 일정 통계 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: class_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 배치 일정 통계 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/batch/stats', validate(ScheduleStatsFilterSchema), asyncWrap(getScheduleStatsBatchController));

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: 일정 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 일정 조회 성공
 *       404:
 *         description: 일정을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:id', validate(ScheduleIdSchema), asyncWrap(getScheduleController));

/**
 * @swagger
 * /schedules/{id}/details:
 *   get:
 *     summary: 일정 상세 정보 조회
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 일정 상세 정보 조회 성공
 *       404:
 *         description: 일정을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:id/details', validate(ScheduleIdSchema), asyncWrap(getScheduleWithDetailsController));

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: 일정 업데이트
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateScheduleRequest'
 *     responses:
 *       200:
 *         description: 일정 업데이트 성공
 *       404:
 *         description: 일정을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', validate(UpdateScheduleSchema), asyncWrap(updateScheduleController));

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: 일정 삭제
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 일정 삭제 성공
 *       404:
 *         description: 일정을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', validate(ScheduleIdSchema), asyncWrap(deleteScheduleController));

export default router; 