
import { Router } from 'express'
import { validateNewTask, newTask, getTasks, getTaskByID, requireAuth, validateID, completeTask, uncompleteTask, updateTask, validateTaskUpdate, deleteTask } from '../controllers/taskController'

const router = Router();

router.get("/", requireAuth, getTasks)
router.post("/",  validateNewTask, newTask)
router.get("/:id", requireAuth, validateID, getTaskByID)
router.put("/:id/complete", requireAuth, validateID, completeTask)
router.put("/:id/uncomplete", requireAuth, validateID, uncompleteTask)
router.put("/:id", requireAuth, validateID, validateTaskUpdate, updateTask)
router.delete("/:id", requireAuth, validateID, deleteTask)

export default router;
