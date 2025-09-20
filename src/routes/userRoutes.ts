
import { registerUser, validateUserRegister, listUsers, loginUser, logoutUser, getUserInfo, deleteUser} from '../controllers/userController'
import { requireAuth } from '../controllers/taskController'
import { Router } from 'express'

const router = Router();

router.post('/register', validateUserRegister, registerUser);
router.post('/login', validateUserRegister, loginUser);
router.post('/logout', logoutUser);
router.delete('/info', deleteUser);
router.get('/info', requireAuth, getUserInfo);
//router.get('/list', listUsers);

export default router;
