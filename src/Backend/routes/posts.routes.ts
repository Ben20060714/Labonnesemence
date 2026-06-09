import { Router } from 'express';
import {
  getPosts,
  getPostBySlug,
  getAllPostsAdmin,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
} from '../controllers/posts.controller';
import { authenticate, requireUser } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route  GET /api/posts
 * @desc   Get all published posts (with optional search & author filter)
 * @access Public
 */
router.get('/', getPosts);

/**
 * @route  GET /api/posts/admin
 * @desc   Get all posts (with draft support — own posts for users, all for admins)
 * @access Private
 */
router.get('/admin', authenticate, requireUser, getAllPostsAdmin);

/**
 * @route  GET /api/posts/:slug
 * @desc   Get single post by slug
 * @access Public
 */
router.get('/:slug', getPostBySlug);

/**
 * @route  POST /api/posts
 * @desc   Create a new post
 * @access Private
 */
router.post('/', authenticate, requireUser, createPost);

/**
 * @route  PUT /api/posts/:id
 * @desc   Update a post (author or admin)
 * @access Private
 */
router.put('/:id', authenticate, requireUser, updatePost);

/**
 * @route  DELETE /api/posts/:id
 * @desc   Delete a post (author or admin)
 * @access Private
 */
router.delete('/:id', authenticate, requireUser, deletePost);

/**
 * @route  PATCH /api/posts/:id/publish
 * @desc   Publish a post
 * @access Private
 */
router.patch('/:id/publish', authenticate, requireUser, publishPost);

/**
 * @route  PATCH /api/posts/:id/unpublish
 * @desc   Unpublish a post
 * @access Private
 */
router.patch('/:id/unpublish', authenticate, requireUser, unpublishPost);

export default router;
