/**
 * Defines the routes for the path /api/v1/auth
 */

import { registerUser, validateUserRegister, loginUser, logoutUser, getUserInfo, deleteUser, getUserStats} from '../controllers/userController'
import { requireAuth } from '../utils/middleware'
import { Router } from 'express'

const router = Router();

router.post('/register', validateUserRegister, registerUser);
router.post('/login', validateUserRegister, loginUser);
router.post('/logout', logoutUser);
router.delete('/info', deleteUser);
router.get('/info', requireAuth, getUserInfo);
router.get('/stats', requireAuth, getUserStats);
//router.get('/list', listUsers);

export default router;
