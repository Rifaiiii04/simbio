import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { generateRoadmapHandler, recommendationsHandler, simbiMatchConsultHandler } from './ai.controller.js';

export const aiRouter = Router();

aiRouter.use(authenticate);

aiRouter.post('/roadmaps/generate', generateRoadmapHandler);
aiRouter.get('/discovery/recommendations', recommendationsHandler);
aiRouter.post('/simbi/match-consult', simbiMatchConsultHandler);
