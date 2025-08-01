import {Router} from "express";
import * as controller from "./auth.controller";
import {asyncWrap} from "../../common/asyncWrap";
import {validate} from "../../common/validator";
import {
  RegisterSchema,
  LoginSchema,
  ChangePasswordSchema,
  ResetPasswordSchema,
  ConfirmResetPasswordSchema,
  TokenSchema,
} from "./auth.validator";

const router = Router();

/**
 * @route POST /auth/register
 * @desc User registration
 * @access Public
 * @body {RegisterRequest} - Registration data (name, email, phone, password)
 */
router.post(
  "/register",
  validate(RegisterSchema),
  asyncWrap(controller.register)
);

/**
 * @route POST /auth/login
 * @desc User login
 * @access Public
 * @body {LoginRequest} - Login credentials (email, password)
 */
router.post(
  "/login",
  validate(LoginSchema),
  asyncWrap(controller.login)
);

/**
 * @route POST /auth/logout/:id
 * @desc User logout
 * @access Private
 * @param {string} id - User ID (numeric string)
 */
router.post(
  "/logout/:id",
  asyncWrap(controller.logout)
);

/**
 * @route PUT /auth/password/:id
 * @desc Change user password
 * @access Private
 * @param {string} id - User ID (numeric string)
 * @body {ChangePasswordRequest} - Password change data
 */
router.put(
  "/password/:id",
  validate(ChangePasswordSchema),
  asyncWrap(controller.changePassword)
);

/**
 * @route POST /auth/password/reset
 * @desc Request password reset
 * @access Public
 * @body {ResetPasswordRequest} - Email for password reset
 */
router.post(
  "/password/reset",
  validate(ResetPasswordSchema),
  asyncWrap(controller.requestPasswordReset)
);

/**
 * @route POST /auth/password/confirm
 * @desc Confirm password reset with token
 * @access Public
 * @body {ConfirmResetPasswordRequest} - Reset token and new password
 */
router.post(
  "/password/confirm",
  validate(ConfirmResetPasswordSchema),
  asyncWrap(controller.confirmPasswordReset)
);

/**
 * @route POST /auth/verify
 * @desc Verify JWT token
 * @access Public
 * @body {TokenRequest} - JWT token to verify
 */
router.post(
  "/verify",
  validate(TokenSchema),
  asyncWrap(controller.verifyToken)
);

/**
 * @route POST /auth/refresh
 * @desc Refresh JWT token
 * @access Public
 * @body {RefreshTokenRequest} - Refresh token
 */
router.post(
  "/refresh",
  validate(TokenSchema.extend({refreshToken: TokenSchema.shape.token})),
  asyncWrap(controller.refreshToken)
);

export default router;
