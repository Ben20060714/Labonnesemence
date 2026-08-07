import { Router } from 'express';
import {
  createDevotion,
  deleteDevotion,
  getCurrentDevotion,
  getDevotions,
  updateDevotion,
} from '../controllers/dailyDevotions.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/current', getCurrentDevotion);
router.get('/', authenticate, requireAdmin, getDevotions);
router.post('/', authenticate, requireAdmin, createDevotion);
router.patch('/:id', authenticate, requireAdmin, updateDevotion);
router.delete('/:id', authenticate, requireAdmin, deleteDevotion);

export default router;
