import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  updatePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route  POST /api/auth/login
 * @desc   Login with email and password
 * @access Public
 */
router.post('/login', login);

/**
 * @route  POST /api/auth/refresh
 * @desc   Get a new access token using refresh token
 * @access Public
 */
router.post('/refresh', refresh);

/**
 * @route  POST /api/auth/logout
 * @desc   Revoke refresh token
 * @access Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route  POST /api/auth/logout-all
 * @desc   Revoke all refresh tokens for the user
 * @access Private
 */
router.post('/logout-all', authenticate, logoutAll);

/**
 * @route  GET /api/auth/me
 * @desc   Get current authenticated user
 * @access Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route  PATCH /api/auth/password
 * @desc   Update password
 * @access Private
 */
router.patch('/password', authenticate, updatePassword);

export default router;
