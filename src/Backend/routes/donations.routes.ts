import { Router } from 'express';
import * as donationsController from '../controllers/donations.controller.ts';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.ts';

const router = Router();

router.get('/monetbil/config', donationsController.getMonetbilConfig);
router.post('/', donationsController.create);
router.post('/monetbil/notify', donationsController.notifyMonetbil);
router.get('/', authenticate, requireAdmin, donationsController.getAll);
router.patch('/:id/status', authenticate, requireAdmin, donationsController.updateStatus);

export default router;
