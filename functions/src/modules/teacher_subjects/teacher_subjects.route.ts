import {Router} from "express";
import * as controller from "./teacher_subjects.controller";
import {asyncWrap} from "../../common/asyncWrap";
import {validate, validateQuery} from "../../common/validator";
import {
  CreateTeacherSubjectSchema,
  UpdateTeacherSubjectSchema,
  TeacherSubjectFilterSchema,
} from "./teacher_subjects.validator";

const router = Router();

/**
 * @route POST /teacher-subjects
 * @desc Create new teacher-subject relationship
 * @access Public
 * @body {CreateTeacherSubjectRequest} - Teacher-subject relationship data
 */
router.post(
  "/",
  validate(CreateTeacherSubjectSchema),
  asyncWrap(controller.createTeacherSubject)
);

/**
 * @route GET /teacher-subjects/search
 * @desc Search teacher-subject relationships with filters
 * @access Public
 * @query {string} teacher_id - Teacher ID filter
 * @query {string} subject_id - Subject ID filter
 * @query {boolean} is_primary - Primary subject filter
 */
router.get(
  "/search",
  validateQuery(TeacherSubjectFilterSchema),
  asyncWrap(controller.getTeacherSubjectsByFilter)
);

/**
 * @route GET /teacher-subjects/:teacherId/:subjectId
 * @desc Get specific teacher-subject relationship
 * @access Public
 * @param {string} teacherId - Teacher ID (numeric string)
 * @param {string} subjectId - Subject ID (numeric string)
 */
router.get("/:teacherId/:subjectId", asyncWrap(controller.getTeacherSubject));

/**
 * @route GET /teacher-subjects/teacher/:teacherId
 * @desc Get all subjects for a teacher
 * @access Public
 * @param {string} teacherId - Teacher ID (numeric string)
 */
router.get("/teacher/:teacherId", asyncWrap(controller.getTeacherSubjects));

/**
 * @route GET /teacher-subjects/subject/:subjectId
 * @desc Get all teachers for a subject
 * @access Public
 * @param {string} subjectId - Subject ID (numeric string)
 */
router.get("/subject/:subjectId", asyncWrap(controller.getSubjectTeachers));

/**
 * @route GET /teacher-subjects/:teacherId/:subjectId/with-details
 * @desc Get teacher-subject relationship with details
 * @access Public
 * @param {string} teacherId - Teacher ID (numeric string)
 * @param {string} subjectId - Subject ID (numeric string)
 */
router.get("/:teacherId/:subjectId/with-details", asyncWrap(controller.getTeacherSubjectWithDetails));

/**
 * @route PUT /teacher-subjects/:teacherId/:subjectId
 * @desc Update teacher-subject relationship
 * @access Public
 * @param {string} teacherId - Teacher ID (numeric string)
 * @param {string} subjectId - Subject ID (numeric string)
 * @body {UpdateTeacherSubjectRequest} - Update data
 */
router.put(
  "/:teacherId/:subjectId",
  validate(UpdateTeacherSubjectSchema),
  asyncWrap(controller.updateTeacherSubject)
);

/**
 * @route DELETE /teacher-subjects/:teacherId/:subjectId
 * @desc Delete teacher-subject relationship
 * @access Public
 * @param {string} teacherId - Teacher ID (numeric string)
 * @param {string} subjectId - Subject ID (numeric string)
 */
router.delete("/:teacherId/:subjectId", asyncWrap(controller.deleteTeacherSubject));

export default router;
