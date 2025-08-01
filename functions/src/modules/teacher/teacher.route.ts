import {Router} from "express";
import * as controller from "./teacher.controller";
import {asyncWrap} from "../../common/asyncWrap";
import {validate, validateQuery} from "../../common/validator";
import {
  CreateTeacherSchema,
  UpdateTeacherSchema,
  TeacherFilterSchema,
} from "./teacher.validator";

const router = Router();

/**
 * @route POST /teachers
 * @desc Create new teacher
 * @access Public
 * @body {CreateTeacherRequest} - Teacher creation data
 */
router.post(
  "/",
  validate(CreateTeacherSchema),
  asyncWrap(controller.createTeacher)
);

/**
 * @route GET /teachers
 * @desc Get all teachers
 * @access Public
 */
router.get("/", asyncWrap(controller.getAllTeachers));

/**
 * @route GET /teachers/search
 * @desc Search teachers with filters
 * @access Public
 * @query {string} user_id - User ID filter
 * @query {string} class_id - Class ID filter
 * @query {string} teacher_name - Teacher name filter (partial match)
 * @query {string} teacher_subject - Teacher subject filter
 * @example
 *   GET /teachers/search?teacher_subject=math&teacher_name=김선생
 *   GET /teachers/search?user_id=123456789
 */
router.get(
  "/search",
  validateQuery(TeacherFilterSchema),
  asyncWrap(controller.getTeachersByFilter)
);

/**
 * @route GET /teachers/:id
 * @desc Get teacher by ID
 * @access Public
 * @param {string} id - Teacher ID (numeric string)
 */
router.get("/:id", asyncWrap(controller.getTeacherById));

/**
 * @route GET /teachers/user/:userId
 * @desc Get teacher by user ID
 * @access Public
 * @param {string} userId - User ID (numeric string)
 */
router.get("/user/:userId", asyncWrap(controller.getTeacherByUserId));

/**
 * @route GET /teachers/:id/with-user
 * @desc Get teacher with user information
 * @access Public
 * @param {string} id - Teacher ID (numeric string)
 */
router.get("/:id/with-user", asyncWrap(controller.getTeacherWithUser));

/**
 * @route GET /teachers/:id/with-subjects
 * @desc Get teacher with subjects information (many-to-many relationship)
 * @access Public
 * @param {string} id - Teacher ID (numeric string)
 */
router.get("/:id/with-subjects", asyncWrap(controller.getTeacherWithSubjects));

/**
 * @route GET /teachers/:id/with-class
 * @desc Get teacher with class information
 * @access Public
 * @param {string} id - Teacher ID (numeric string)
 */
router.get("/:id/with-class", asyncWrap(controller.getTeacherWithClass));

/**
 * @route POST /teachers/assign-subject
 * @desc Assign subject to teacher (many-to-many relationship)
 * @access Public
 * @body {teacherId: string, subjectId: string, isPrimary?: boolean}
 */
router.post("/assign-subject", asyncWrap(controller.assignSubjectToTeacher));

/**
 * @route DELETE /teachers/remove-subject
 * @desc Remove subject from teacher (many-to-many relationship)
 * @access Public
 * @body {teacherId: string, subjectId: string}
 */
router.delete("/remove-subject", asyncWrap(controller.removeSubjectFromTeacher));

/**
 * @route GET /teachers/check/:userId
 * @desc Check if teacher profile exists for user ID
 * @access Public
 * @param {string} userId - User ID (numeric string)
 */
router.get("/check/:userId", asyncWrap(controller.checkTeacherExists));

/**
 * @route PUT /teachers/:id
 * @desc Update teacher profile information
 * @access Public
 * @param {string} id - Teacher ID (numeric string)
 * @body {UpdateTeacherRequest} - Teacher update data
 */
router.put(
  "/:id",
  validate(UpdateTeacherSchema),
  asyncWrap(controller.updateTeacher)
);

/**
 * @route DELETE /teachers/:id
 * @desc Delete teacher
 * @access Public
 * @param {string} id - Teacher ID (numeric string)
 */
router.delete("/:id", asyncWrap(controller.deleteTeacher));

export default router;
