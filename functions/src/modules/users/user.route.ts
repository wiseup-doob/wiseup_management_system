import {Router} from "express";
import * as controller from "./user.controller";
import {asyncWrap} from "../../common/asyncWrap";
import {validate, validateQuery} from "../../common/validator";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserFilterSchema,
} from "./user.validator";

const router = Router();

/**
 * @route POST /users
 * @desc Create new user
 * @access Public
 * @body {CreateUserRequest} - User creation data
 */
router.post(
  "/",
  validate(CreateUserSchema),
  asyncWrap(controller.createUser)
);

/**
 * @route GET /users
 * @desc Get all users
 * @access Public
 */
router.get("/", asyncWrap(controller.getAllUsers));

/**
 * @route GET /users/search
 * @desc Search users with filters
 * @access Public
 * @query {string} status - User status filter (active/inactive)
 * @query {string} email - Email filter (exact match)
 * @query {string} phone - Phone filter (exact match)
 * @query {string} name - Name filter (partial match)
 * @example
 *   GET /users/search?status=active&name=김철수
 *   GET /users/search?email=test@example.com
 */
router.get(
  "/search",
  validateQuery(UserFilterSchema),
  asyncWrap(controller.getUsersByFilter)
);

/**
 * @route GET /users/:id
 * @desc Get user by ID
 * @access Public
 * @param {string} id - User ID (numeric string)
 */
router.get("/:id", asyncWrap(controller.getUserById));

/**
 * @route GET /users/email/:email
 * @desc Get user by email
 * @access Public
 * @param {string} email - User email
 */
router.get("/email/:email", asyncWrap(controller.getUserByEmail));

/**
 * @route PUT /users/:id
 * @desc Update user profile information
 * @access Public
 * @param {string} id - User ID (numeric string)
 * @body {UpdateUserRequest} - User update data (password excluded)
 */
router.put(
  "/:id",
  validate(UpdateUserSchema),
  asyncWrap(controller.updateUser)
);

/**
 * @route DELETE /users/:id
 * @desc Delete user
 * @access Public
 * @param {string} id - User ID (numeric string)
 */
router.delete("/:id", asyncWrap(controller.deleteUser));

/**
 * @route GET /users/check/email/:email
 * @desc Check email availability
 * @access Public
 * @param {string} email - Email to check
 */
router.get("/check/email/:email", asyncWrap(controller.checkEmailAvailability));

/**
 * @route GET /users/check/phone/:phone
 * @desc Check phone number availability
 * @access Public
 * @param {string} phone - Phone number to check (URL encoded)
 */
router.get("/check/phone/:phone", asyncWrap(controller.checkPhoneAvailability));

export default router;
