
/**
 * Defines the controllers for public HTML routes
 */
import { Request, Response } from "express"

import path from 'path'

const root = path.join(__dirname, '../../views')

export async function landingPage(req: Request, res: Response) {
    res.sendFile(path.join(root, "index.html"));
}

export async function loginPage(req: Request, res: Response) {
    res.sendFile(path.join(root, "login.html"));
}

export async function registerPage(req: Request, res: Response) {
    res.sendFile(path.join(root, "register.html"));
}
export async function dashboardPage(req: Request, res: Response) {
    res.sendFile(path.join(root, "dashboard.html"));
}
