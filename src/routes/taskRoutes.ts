/**
 * Defines the routes for the path /api/v1/tasks
 */

import { Router } from 'express'
import { validateNewTask, newTask, getTasks, getTaskByID,  completeTask, uncompleteTask, updateTask, validateTaskUpdate, deleteTask, refreshTask, restoreTask } from '../controllers/taskController'

import { requireAuth, validateID } from '../utils/middleware'
const router = Router();

router.get("/", requireAuth, getTasks)
router.post("/",  validateNewTask, newTask)
router.get("/:id", requireAuth, validateID, getTaskByID)
router.put("/:id/complete", requireAuth, validateID, completeTask)
router.put("/:id/refresh", requireAuth, validateID, refreshTask)
router.put("/:id/uncomplete", requireAuth, validateID, uncompleteTask)
router.put("/:id", requireAuth, validateID, validateTaskUpdate, updateTask)
router.delete("/:id", requireAuth, validateID, deleteTask)
router.put("/:id/restore", requireAuth, validateID, restoreTask)

export default router;
