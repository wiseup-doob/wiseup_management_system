import { Router } from "express";
import { validate } from "../../common/validator";
import {
  CreateRoleSchema,
  UpdateRoleSchema,
} from "./roles.validator";
import { asyncWrap } from "../../common/asyncWrap";
import {
  createRoleController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
  getAllRolesController,
  getRolesByFilterController,
} from "./roles.controller";

const router = Router();

/**
 * @route POST /roles
 * @desc Create a new role
 * @access Public
 * @body {CreateRoleRequest} - Role data
 */
router.post(
  "/",
  validate(CreateRoleSchema),
  asyncWrap(createRoleController)
);

/**
 * @route GET /roles
 * @desc Get all roles or filter roles
 * @access Public
 * @query {RoleFilter} - Filter parameters (optional)
 */
router.get(
  "/",
  asyncWrap(getRolesByFilterController)
);

/**
 * @route GET /roles/all
 * @desc Get all roles
 * @access Public
 */
router.get(
  "/all",
  asyncWrap(getAllRolesController)
);

/**
 * @route GET /roles/:id
 * @desc Get role by ID
 * @access Public
 * @param {string} id - Role ID
 */
router.get(
  "/:id",
  asyncWrap(getRoleByIdController)
);

/**
 * @route PUT /roles/:id
 * @desc Update role
 * @access Public
 * @param {string} id - Role ID
 * @body {UpdateRoleRequest} - Updated role data
 */
router.put(
  "/:id",
  validate(UpdateRoleSchema),
  asyncWrap(updateRoleController)
);

/**
 * @route DELETE /roles/:id
 * @desc Delete role
 * @access Public
 * @param {string} id - Role ID
 */
router.delete(
  "/:id",
  asyncWrap(deleteRoleController)
);

export default router;
