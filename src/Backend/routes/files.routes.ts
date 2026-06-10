import { Router } from 'express';
import {
  uploadFile,
  uploadMultipleFiles,
  downloadFile,
  streamFile,
  getFiles,
  getPublicFiles,
  getFileInfo,
  deleteFile,
  updateFileVisibility,
} from '../controllers/files.controller';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @route  POST /api/files/upload
 * @desc   Upload a single file
 * @body   multipart/form-data: file, is_public (optional)
 * @access Private
 */
router.post('/upload', authenticate, upload.single('file'), uploadFile);

/**
 * @route  POST /api/files/upload-multiple
 * @desc   Upload multiple files (max 10)
 * @body   multipart/form-data: files[], is_public (optional)
 * @access Private
 */
router.post('/upload-multiple', authenticate, upload.array('files', 10), uploadMultipleFiles);

/**
 * @route  GET /api/files/public
 * @desc   List public files for the public gallery
 * @access Public
 */
router.get('/public', getPublicFiles);

/**
 * @route  GET /api/files
 * @desc   List files (own files for users, all for admins)
 * @access Private
 */
router.get('/', authenticate, getFiles);

/**
 * @route  GET /api/files/:id/info
 * @desc   Get file metadata
 * @access Private (or public if file is_public)
 */
router.get('/:id/info', optionalAuthenticate, getFileInfo);

/**
 * @route  GET /api/files/:id/download
 * @desc   Download a file with Content-Disposition attachment header
 * @access Private (or public if file is_public)
 */
router.get('/:id/download', optionalAuthenticate, downloadFile);

/**
 * @route  GET /api/files/:id/stream
 * @desc   Stream/view a file inline (e.g. images, PDFs)
 * @access Private (or public if file is_public)
 */
router.get('/:id/stream', optionalAuthenticate, streamFile);

/**
 * @route  PATCH /api/files/:id/visibility
 * @desc   Toggle file visibility (public/private)
 * @access Private (owner or admin)
 */
router.patch('/:id/visibility', authenticate, updateFileVisibility);

/**
 * @route  DELETE /api/files/:id
 * @desc   Delete a file
 * @access Private (owner or admin)
 */
router.delete('/:id', authenticate, deleteFile);

export default router;
