
/**
 * Defines the routes for the path /api/v1/rewards
 */

import { Router } from 'express'
import { landingPage, loginPage, registerPage, dashboardPage } from '../controllers/frontendController'


const router = Router();

router.get("/", landingPage);
router.get("/login", loginPage);
router.get("/register", registerPage);
router.get("/dashboard", dashboardPage);

export default router;
