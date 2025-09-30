
/**
 * Defines the routes for the path /api/v1/auth
 */

import { registerUser, validateUserRegister, loginUser, logoutUser, } from '../controllers/userController'
import { Router } from 'express'

const router = Router();

router.post('/register', validateUserRegister, registerUser);
router.post('/login', validateUserRegister, loginUser);
router.post('/logout', logoutUser);

export default router;
