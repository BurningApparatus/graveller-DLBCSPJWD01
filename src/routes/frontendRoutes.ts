
/**
 * Defines the routes for the root path (serving html)
 */

import { Router } from 'express'
import { landingPage, loginPage, registerPage, dashboardPage } from '../controllers/frontendController'


const router = Router();

router.get("/", landingPage);
router.get("/login", loginPage);
router.get("/register", registerPage);
router.get("/dashboard", dashboardPage);

export default router;
