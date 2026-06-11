import { Router } from 'express';
import {
  getAllUsers,
  getPublicUsers,
  getUserById,
  updateUser,
  deleteUser,
  adminCreateUser,
} from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/public', getPublicUsers);

/**
 * @route  GET /api/users
 * @desc   Get all users (admin only)
 * @access Admin
 */
router.get('/', authenticate, requireAdmin, getAllUsers);

/**
 * @route  POST /api/users
 * @desc   Admin create a user
 * @access Admin
 */
router.post('/', authenticate, requireAdmin, adminCreateUser);

/**
 * @route  GET /api/users/:id
 * @desc   Get user by ID (admin or self)
 * @access Private
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route  PUT /api/users/:id
 * @desc   Update user (admin or self)
 * @access Private
 */
router.put('/:id', authenticate, updateUser);

/**
 * @route  DELETE /api/users/:id
 * @desc   Delete user (admin or self)
 * @access Private
 */
router.delete('/:id', authenticate, deleteUser);

export default router;
