import {Router} from "express";
import * as controller from "./subjects.controller";
import {asyncWrap} from "../../common/asyncWrap";
import {validate, validateQuery} from "../../common/validator";
import {
  CreateSubjectSchema,
  UpdateSubjectSchema,
  SubjectFilterSchema,
} from "./subjects.validator";

const router = Router();

/**
 * @route POST /subjects
 * @desc Create new subject
 * @access Public
 * @body {CreateSubjectRequest} - Subject creation data
 */
router.post(
  "/",
  validate(CreateSubjectSchema),
  asyncWrap(controller.createSubject)
);

/**
 * @route GET /subjects
 * @desc Get all subjects
 * @access Public
 */
router.get("/", asyncWrap(controller.getAllSubjects));


/**
 * @route GET /subjects/search
 * @desc Search subjects with filters
 * @access Public
 * @query {string} name - Subject name filter (partial match)
 * @example
 *   GET /subjects/search?name=수학
 */
router.get(
  "/search",
  validateQuery(SubjectFilterSchema),
  asyncWrap(controller.getSubjectsByFilter)
);

/**
 * @route GET /subjects/:id
 * @desc Get subject by ID
 * @access Public
 * @param {string} id - Subject ID (numeric string)
 */
router.get("/:id", asyncWrap(controller.getSubjectById));


/**
 * @route GET /subjects/:id/with-teachers
 * @desc Get subject with teachers information
 * @access Public
 * @param {string} id - Subject ID (numeric string)
 */
router.get("/:id/with-teachers", asyncWrap(controller.getSubjectWithTeachers));

/**
 * @route GET /subjects/:id/with-classes
 * @desc Get subject with classes information
 * @access Public
 * @param {string} id - Subject ID (numeric string)
 */
router.get("/:id/with-classes", asyncWrap(controller.getSubjectWithClasses));

/**
 * @route GET /subjects/check/:name
 * @desc Check if subject exists by name
 * @access Public
 * @param {string} name - Subject name to check
 */
router.get("/check/:name", asyncWrap(controller.checkSubjectExists));

/**
 * @route PUT /subjects/:id
 * @desc Update subject information
 * @access Public
 * @param {string} id - Subject ID (numeric string)
 * @body {UpdateSubjectRequest} - Subject update data
 */
router.put(
  "/:id",
  validate(UpdateSubjectSchema),
  asyncWrap(controller.updateSubject)
);

/**
 * @route DELETE /subjects/:id
 * @desc Delete subject
 * @access Public
 * @param {string} id - Subject ID (numeric string)
 */
router.delete("/:id", asyncWrap(controller.deleteSubject));

export default router;
