import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  registerHandler,
  loginHandler,
  getMeHandler,
  logoutHandler,
} from './auth.controller.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/logout', authenticate, logoutHandler);
router.get('/me', authenticate, getMeHandler);

export { router as authRouter };
