/**
 * Defines the routes for the path /api/v1/rewards
 */

import { Router } from 'express'
import { requireAuth, getRewards, validateNewReward, newReward, validateID, getRewardByID, completeReward, validateUpdateReward, updateReward, deleteReward, restoreReward } from '../controllers/rewardController'

const router = Router();

router.get("/", requireAuth, getRewards)
router.post("/",  requireAuth, validateNewReward, newReward)
router.get("/:id", requireAuth, validateID, getRewardByID)
router.put("/:id/complete", requireAuth, validateID, completeReward)
router.put("/:id", requireAuth, validateID, validateUpdateReward, updateReward)
router.delete("/:id", requireAuth, validateID, deleteReward)
router.put("/:id/restore", requireAuth, validateID, restoreReward)

export default router;
