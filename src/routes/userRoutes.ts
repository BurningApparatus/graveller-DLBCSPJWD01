
import { registerUser, validateUserRegister, listUsers, loginUser, logoutUser, getUserInfo } from '../controllers/userController'
import { Router } from 'express'

const router = Router();

router.post('/register', validateUserRegister, registerUser);
router.post('/login', validateUserRegister, loginUser);
router.get('/logout', logoutUser);
//router.get('/info', getUserInfo);
//router.get('/list', listUsers);

export default router;
