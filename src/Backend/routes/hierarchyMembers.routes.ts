import { Router } from 'express';
import {
  createHierarchyMember,
  deleteHierarchyMember,
  getHierarchyMembers,
  getPublicHierarchyMembers,
} from '../controllers/hierarchyMembers.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/public', getPublicHierarchyMembers);
router.get('/', authenticate, requireAdmin, getHierarchyMembers);
router.post('/', authenticate, requireAdmin, createHierarchyMember);
router.delete('/:id', authenticate, requireAdmin, deleteHierarchyMember);

export default router;
