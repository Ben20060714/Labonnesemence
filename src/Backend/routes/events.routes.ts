import { Router } from 'express';
import * as eventsController from '../controllers/events.controller.ts';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/', eventsController.getAll);
router.post('/', authenticate, requireAdmin, eventsController.create);
router.put('/:id', authenticate, requireAdmin, eventsController.update);
router.delete('/:id', authenticate, requireAdmin, eventsController.remove);

export default router;