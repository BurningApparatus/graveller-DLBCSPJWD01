/**
 * Defines the routes for the path /api/v1/user
 */

import { registerUser, validateUserRegister, loginUser, logoutUser, getUserInfo, deleteUser, getUserStats} from '../controllers/userController'
import { requireAuth } from '../utils/middleware'
import { Router } from 'express'

const router = Router();

router.delete('/', requireAuth, deleteUser);
router.get('/', requireAuth, getUserInfo);
router.get('/stats', requireAuth, getUserStats);
//router.get('/list', listUsers);

export default router;
