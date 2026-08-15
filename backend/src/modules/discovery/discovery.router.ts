import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { peopleHandler, matchesHandler, mapHandler } from './discovery.controller.js';

const router = Router();
router.use(authenticate);
router.get('/people', peopleHandler);
router.get('/matches', matchesHandler);
router.get('/map', mapHandler);
export { router as discoveryRouter };
