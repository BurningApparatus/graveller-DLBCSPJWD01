
import { Request, Response } from "express"

/**
 * Middleware function which ensures that a user has a valid session token
 */
export function requireAuth(req: Request, res: Response, next: Function) {

    let user = req.session.user;
    console.log(req.session);
    if (!user) {
        return res.status(401).json({ error: `You are not logged in.` });
    }
    next();
}


/**
 * Middleware function which ensures that the :id field in dynamic routes is a valid Integer
 * @remarks 
 * This function does NOT ensure that the :id belongs to any one user or exists at all 
 * in the database
 */
export function validateID(req: Request, res: Response, next: Function) {
    const rewardID = parseInt(req.params.id, 10);
    if (isNaN(rewardID)) {
        return res.status(400).json({ error: "Reward ID must be a number." });
    }
    req.params.id = rewardID.toString(); // store parsed ID back
    next();
}

