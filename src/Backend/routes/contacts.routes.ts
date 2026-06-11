import { Router } from 'express';
import * as contactsController from '../controllers/contacts.controller.ts';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.ts';

const router = Router();

router.post('/', contactsController.create);
router.get('/', authenticate, requireAdmin, contactsController.getAll);
router.delete('/:id', authenticate, requireAdmin, contactsController.remove);

export default router;
