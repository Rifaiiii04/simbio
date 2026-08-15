import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { generateRoadmapHandler, recommendationsHandler } from './ai.controller.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.post('/roadmaps/generate', generateRoadmapHandler);
aiRouter.get('/discovery/recommendations', recommendationsHandler);
