import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRouter } from './modules/health/health.router.js';
import { authRouter } from './modules/auth/auth.router.js';
import { usersRouter } from './modules/users/users.router.js';
import { skillsRouter } from './modules/skills/skills.router.js';
import { learningGoalsRouter } from './modules/learning-goals/learning-goals.router.js';
import { roadmapsRouter } from './modules/roadmaps/roadmaps.router.js';
import { milestonesRouter } from './modules/milestones/milestones.router.js';
import { commitmentsRouter } from './modules/commitments/commitments.router.js';
import { checkInsRouter } from './modules/check-ins/check-ins.router.js';
import { focusSessionsRouter } from './modules/focus-sessions/focus-sessions.router.js';
import { partnershipsRouter } from './modules/partnerships/partnerships.router.js';
import { projectsRouter } from './modules/projects/projects.router.js';
import { reviewsRouter } from './modules/reviews/reviews.router.js';
import { discoveryRouter } from './modules/discovery/discovery.router.js';
import { aiRouter } from './modules/ai/ai.router.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const corsOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/skills', skillsRouter);
app.use('/api/v1/categories', skillsRouter);
app.use('/api/v1/goals', learningGoalsRouter);
app.use('/api/v1/roadmaps', roadmapsRouter);
app.use('/api/v1/milestones', milestonesRouter);
app.use('/api/v1/commitments', commitmentsRouter);
app.use('/api/v1/checkins', checkInsRouter);
app.use('/api/v1/focus-sessions', focusSessionsRouter);
app.use('/api/v1/partnerships', partnershipsRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/discovery', discoveryRouter);
app.use('/api/v1/ai', aiRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
