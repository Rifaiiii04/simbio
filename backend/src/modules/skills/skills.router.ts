import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  getCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  getSkillsHandler,
  createSkillHandler,
  updateSkillHandler,
  deleteSkillHandler,
  getSkillHandler,
  getUserSkillsHandler,
  addUserSkillHandler,
  updateUserSkillHandler,
  deleteUserSkillHandler,
} from './skills.controller.js';

const router = Router();

// Public skill & category catalog
router.get('/', getSkillsHandler);
router.get('/categories', getCategoriesHandler);

// Admin Category CRUD
router.post('/categories', authenticate, createCategoryHandler);
router.patch('/categories/:id', authenticate, updateCategoryHandler);
router.delete('/categories/:id', authenticate, deleteCategoryHandler);

// Admin Skill CRUD
router.post('/', authenticate, createSkillHandler);
router.patch('/:id', authenticate, updateSkillHandler);
router.delete('/:id', authenticate, deleteSkillHandler);
router.get('/:id', getSkillHandler);

// Authenticated user skills
router.get('/me/skills', authenticate, getUserSkillsHandler);
router.post('/me/skills', authenticate, addUserSkillHandler);
router.patch('/me/skills/:id', authenticate, updateUserSkillHandler);
router.delete('/me/skills/:id', authenticate, deleteUserSkillHandler);

export { router as skillsRouter };
