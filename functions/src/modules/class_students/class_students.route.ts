import {Router} from "express";
import * as controller from "./class_students.controller";
import {asyncWrap} from "../../common/asyncWrap";
import {validate, validateQuery} from "../../common/validator";
import {
  CreateClassStudentSchema,
  UpdateClassStudentSchema,
  ClassStudentFilterSchema,
} from "./class_students.validator";

const router = Router();

/**
 * @route POST /class-students
 * @desc Create new class-student relationship (enroll student in class)
 * @access Public
 * @body {CreateClassStudentRequest} - Class-student relationship data
 */
router.post(
  "/",
  validate(CreateClassStudentSchema),
  asyncWrap(controller.createClassStudent)
);

/**
 * @route GET /class-students/search
 * @desc Search class-student relationships with filters
 * @access Public
 * @query {string} class_id - Class ID filter
 * @query {string} student_id - Student ID filter
 * @query {string} status - Status filter (active, inactive, graduated, transferred)
 * @query {date} enrollment_date_from - Enrollment date from filter
 * @query {date} enrollment_date_to - Enrollment date to filter
 */
router.get(
  "/search",
  validateQuery(ClassStudentFilterSchema),
  asyncWrap(controller.getClassStudentsByFilter)
);

/**
 * @route GET /class-students/:classId/:studentId
 * @desc Get specific class-student relationship
 * @access Public
 * @param {string} classId - Class ID (numeric string)
 * @param {string} studentId - Student ID (numeric string)
 */
router.get("/:classId/:studentId", asyncWrap(controller.getClassStudent));

/**
 * @route GET /class-students/class/:classId
 * @desc Get all students for a class
 * @access Public
 * @param {string} classId - Class ID (numeric string)
 */
router.get("/class/:classId", asyncWrap(controller.getClassStudents));

/**
 * @route GET /class-students/student/:studentId
 * @desc Get all classes for a student
 * @access Public
 * @param {string} studentId - Student ID (numeric string)
 */
router.get("/student/:studentId", asyncWrap(controller.getStudentClasses));

/**
 * @route GET /class-students/:classId/:studentId/with-details
 * @desc Get class-student relationship with details
 * @access Public
 * @param {string} classId - Class ID (numeric string)
 * @param {string} studentId - Student ID (numeric string)
 */
router.get("/:classId/:studentId/with-details", asyncWrap(controller.getClassStudentWithDetails));

/**
 * @route GET /class-students/class/:classId/with-students
 * @desc Get class with all students information
 * @access Public
 * @param {string} classId - Class ID (numeric string)
 */
router.get("/class/:classId/with-students", asyncWrap(controller.getClassWithStudents));

/**
 * @route GET /class-students/student/:studentId/with-classes
 * @desc Get student with all classes information
 * @access Public
 * @param {string} studentId - Student ID (numeric string)
 */
router.get("/student/:studentId/with-classes", asyncWrap(controller.getStudentWithClasses));

/**
 * @route PUT /class-students/:classId/:studentId
 * @desc Update class-student relationship
 * @access Public
 * @param {string} classId - Class ID (numeric string)
 * @param {string} studentId - Student ID (numeric string)
 * @body {UpdateClassStudentRequest} - Update data
 */
router.put(
  "/:classId/:studentId",
  validate(UpdateClassStudentSchema),
  asyncWrap(controller.updateClassStudent)
);

/**
 * @route DELETE /class-students/:classId/:studentId
 * @desc Delete class-student relationship (remove student from class)
 * @access Public
 * @param {string} classId - Class ID (numeric string)
 * @param {string} studentId - Student ID (numeric string)
 */
router.delete("/:classId/:studentId", asyncWrap(controller.deleteClassStudent));

export default router;
