import { Router } from "express";
import { validate } from "../../common/validator";
import {
  AssignUserRoleSchema,
} from "./user_roles.validator";
import { asyncWrap } from "../../common/asyncWrap";
import {
  assignUserRoleController,
  getUserRolesController,
  removeUserRoleController,
  hasRoleController,
  getUserRolesByFilterController,
  getUserWithRolesController,
  getRoleWithUsersController,
} from "./user_roles.controller";

const router = Router();

/**
 * @route POST /user-roles/assign
 * @desc Assign role to user
 * @access Public
 * @body {AssignUserRoleRequest} - Role assignment data
 */
router.post(
  "/assign",
  validate(AssignUserRoleSchema),
  asyncWrap(assignUserRoleController)
);

/**
 * @route GET /user-roles
 * @desc Get user roles by filter
 * @access Public
 * @query {UserRoleFilter} - Filter parameters
 */
router.get(
  "/",
  asyncWrap(getUserRolesByFilterController)
);

/**
 * @route GET /user-roles/user/:userId
 * @desc Get user roles
 * @access Public
 * @param {string} userId - User ID
 */
router.get(
  "/user/:userId",
  asyncWrap(getUserRolesController)
);

/**
 * @route GET /user-roles/user/:userId/with-roles
 * @desc Get user with roles information
 * @access Public
 * @param {string} userId - User ID
 */
router.get(
  "/user/:userId/with-roles",
  asyncWrap(getUserWithRolesController)
);

/**
 * @route DELETE /user-roles/user/:userId/role/:roleId
 * @desc Remove user role
 * @access Public
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 */
router.delete(
  "/user/:userId/role/:roleId",
  asyncWrap(removeUserRoleController)
);

/**
 * @route GET /user-roles/user/:userId/has/:roleId
 * @desc Check if user has specific role
 * @access Public
 * @param {string} userId - User ID
 * @param {string} roleId - Role ID
 */
router.get(
  "/user/:userId/has/:roleId",
  asyncWrap(hasRoleController)
);

/**
 * @route GET /user-roles/role/:roleId/with-users
 * @desc Get role with users information
 * @access Public
 * @param {string} roleId - Role ID
 */
router.get(
  "/role/:roleId/with-users",
  asyncWrap(getRoleWithUsersController)
);

export default router;
