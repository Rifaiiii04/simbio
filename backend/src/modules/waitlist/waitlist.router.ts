import { Router } from 'express';
import { waitlistController } from './waitlist.controller.js';
// import { requireAuth, requireAdmin } from '../../middleware/auth'; // Assuming we have auth middleware

const router = Router();

// Public route to join waitlist
router.post('/', waitlistController.joinWaitlist.bind(waitlistController));

// Admin route to get waitlist (For now we'll make it public or assume auth is handled later if not available)
router.get('/', waitlistController.getWaitlist.bind(waitlistController));

export { router as waitlistRouter };
