import { Router } from 'express';
import * as sermonsController from '../controllers/sermons.controller.ts';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/', sermonsController.getAll);
router.post('/', authenticate, requireAdmin, sermonsController.create);
router.put('/:id', authenticate, requireAdmin, sermonsController.update);
router.delete('/:id', authenticate, requireAdmin, sermonsController.remove);

export default router;