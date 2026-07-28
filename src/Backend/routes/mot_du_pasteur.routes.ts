import { Router } from 'express';
import {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} from '../controllers/pastorMessages.controller.ts';
import { authenticate, requireAdmin, requireUser } from '../middlewares/auth.middleware.ts';

const router = Router();

/**
 * @route  GET /api/mot_du_pasteur
 * @desc   Get all pastor messages
 * @access Private (users read-only, admins too)
 */
router.get('/', authenticate, requireUser, getMessages);

/**
 * @route  GET /api/mot_du_pasteur/:id
 * @desc   Get a single pastor message by id
 * @access Private (users read-only, admins too)
 */
router.get('/:id', authenticate, requireUser, getMessageById);

/**
 * @route  POST /api/mot_du_pasteur
 * @desc   Create a new pastor message
 * @access Admin
 */
router.post('/', authenticate, requireAdmin, createMessage);

/**
 * @route  PUT /api/mot_du_pasteur/:id
 * @desc   Update a pastor message
 * @access Admin
 */
router.put('/:id', authenticate, requireAdmin, updateMessage);

/**
 * @route  DELETE /api/mot_du_pasteur/:id
 * @desc   Delete a pastor message
 * @access Admin
 */
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

export default router;
