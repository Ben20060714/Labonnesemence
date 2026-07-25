import { Router } from 'express';
import * as newsletterController from '../controllers/newsletter.controller.ts';

const router = Router();

router.post('/subscribe', newsletterController.subscribe);

export default router;

