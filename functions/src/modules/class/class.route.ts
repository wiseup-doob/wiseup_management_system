import {Router} from "express";
import {validate} from "../../common/validator";
import {
  CreateClassSchema,
  UpdateClassSchema,
  ClassFilterSchema,
} from "./class.validator";
import {asyncWrap} from "../../common/asyncWrap";
import {
  createClassController,
  getClassByIdController,
  updateClassController,
  deleteClassController,
  getClassesByFilterController,
  getAllClassesController,
  getClassWithTeacherController,
  getClassWithSubjectController,
  getClassWithStudentsController,
  getClassWithDetailsController,
  checkClassNameExistsController,
} from "./class.controller";

const router = Router();

/**
 * @route POST /classes
 * @desc Create new class
 * @access Public
 * @body {CreateClassRequest} - Class creation data
 */
router.post(
  "/",
  validate(CreateClassSchema),
  asyncWrap(createClassController)
);

/**
 * @route GET /classes
 * @desc Get all classes or filter classes
 * @access Public
 * @query {ClassFilter} - Filter parameters
 */
router.get(
  "/",
  validate(ClassFilterSchema),
  asyncWrap(getClassesByFilterController)
);

/**
 * @route GET /classes/all
 * @desc Get all classes without filtering
 * @access Public
 */
router.get(
  "/all",
  asyncWrap(getAllClassesController)
);

/**
 * @route GET /classes/:id
 * @desc Get class by ID
 * @access Public
 * @param {string} id - Class ID
 */
router.get(
  "/:id",
  asyncWrap(getClassByIdController)
);

/**
 * @route PUT /classes/:id
 * @desc Update class by ID
 * @access Public
 * @param {string} id - Class ID
 * @body {UpdateClassRequest} - Class update data
 */
router.put(
  "/:id",
  validate(UpdateClassSchema),
  asyncWrap(updateClassController)
);

/**
 * @route DELETE /classes/:id
 * @desc Delete class by ID
 * @access Public
 * @param {string} id - Class ID
 */
router.delete(
  "/:id",
  asyncWrap(deleteClassController)
);

/**
 * @route GET /classes/:id/with-teacher
 * @desc Get class with teacher information
 * @access Public
 * @param {string} id - Class ID
 */
router.get(
  "/:id/with-teacher",
  asyncWrap(getClassWithTeacherController)
);

/**
 * @route GET /classes/:id/with-subject
 * @desc Get class with subject information
 * @access Public
 * @param {string} id - Class ID
 */
router.get(
  "/:id/with-subject",
  asyncWrap(getClassWithSubjectController)
);

/**
 * @route GET /classes/:id/with-students
 * @desc Get class with students information
 * @access Public
 * @param {string} id - Class ID
 */
router.get(
  "/:id/with-students",
  asyncWrap(getClassWithStudentsController)
);

/**
 * @route GET /classes/:id/with-details
 * @desc Get class with all related information (teacher, subject, students)
 * @access Public
 * @param {string} id - Class ID
 */
router.get(
  "/:id/with-details",
  asyncWrap(getClassWithDetailsController)
);

/**
 * @route GET /classes/check/:name
 * @desc Check if class name exists
 * @access Public
 * @param {string} name - Class name to check
 */
router.get(
  "/check/:name",
  asyncWrap(checkClassNameExistsController)
);

export default router;
