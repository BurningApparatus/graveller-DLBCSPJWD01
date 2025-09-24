

import { rewardTable, userTable, transactionTable } from '../db/sqlite3/db'

import { Request, Response } from "express"
import { SqliteError } from "better-sqlite3";

/**
 * Middleware function for validating the JSON body for the New Reward API call
 */
export function validateNewReward(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, value } = req.body;


    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof value !== "number" 
    ) {
        return res.status(400).json({ error: "invalid types for new reward" });
    }

    next();
}

/**
 * Middleware function for validating the JSON body for the Update Reward API call
 */
export function validateUpdateReward(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, value, completions } = req.body;


    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof value !== "number" ||
        typeof completions !== "number"
    ) {
        return res.status(400).json({ error: "invalid types for reward update" });
    }

    next();
}

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


/** 
 * POST Route for delcaring a new Reward. 
 * Assumes auth and validateNewReward middleware are passed.
 */
export async function newReward(req: Request, res: Response) {
    // We get the attributes from the JSON body
    // This is safe because of validateNewReward middleware
    const { name, description, value } = req.body;
    let user = req.session.user;

    if (value < 0) {
        return res.status(400).json({ error: "Reward value must be non-negative." });

    }

    try {
        // We create a new reward with the given parameters from the JSON
        let newReward = await rewardTable.createReward({
            rewardID: -1, // This value is ignored by the createReward function
            userID: user?.userID || -1, // This is fine because of the requireAuth middleware
            name: name,
            description: description,
            value: value,
            completions: 0,
            deleted: false,
        });
        res.json({ success: true, message: "Reward added", reward: {
            rewardID: newReward.rewardID,
            name: name,
            description: description,
            value: value,
            completions: 0
        } });
    }
    catch (err){
        if (err instanceof SqliteError) {
                return res.status(500).json({ 
                    error: `Database error ${err.code}: ${err.message}`
                }); 
        }
        else {
            return res.status(500).json({ 
                error: `Internal Server error`
            }); 
        }
    }
        

}


/**
 * GET route for all rewards for one user. requires authentication.
 */
export async function getRewards(req: Request, res: Response) {
    let user = req.session.user;
    try {
        let rewards = await rewardTable.getRewardsForUser(user?.userID || -1);
        console.log(rewards);
        res.json({success: "true", rewards: rewards});
    }
    catch (err){
        if (err instanceof SqliteError) {
            return res.status(500).json({ 
                error: `Database error ${err.code}: ${err.message}`
            }); 
        }
        return res.status(500).json({ 
            error: `Internal Server error`
        }); 
    }

}

/**
 * PUT route for completing a reward for a user. 
 * Adds one the the "completions" field on a particular reward.
 * Has a side-effect of directly updating the balance of the user, 
 * and adds an entry to the transasction table. 
 *
 * Expects valid auth and :id.
 */
export async function completeReward(req: Request, res: Response) {

    // This conversion is safe because of validateID middleware
    let userID = req.session.user?.userID || -1;

    // The rewardID from the URL
    let rewardIDstring = req.params.id;
    let rewardID = parseInt(rewardIDstring );
 
    // The try catch is necessary as all database operations may return SQLite errors
    try {

        // We check that the reward exists and belongs to the user 
        let old_reward = await rewardTable.getRewardForUser(userID, rewardID);
        let current_user = await userTable.getByID(userID);
        if (old_reward) {

            // We also subtract balance to the current user
            if (!current_user) {
                // Whatever this scenario is, refreshing the cookie should fix it.
                return res.status(500).json({ 
                    error: `Error getting user information. Please log in again`
                }); 
            }
            // We change the user and reward records
            current_user.balance -= old_reward.value;
            userTable.updateUser(userID, current_user);

            // We add a transaction for the current date
            transactionTable.createTransaction({
                transactionID: -1,
                userID: userID,
                amount: -old_reward.value,
                date: new Date(),
            })
            old_reward.completions++;
            rewardTable.updateReward(rewardID, old_reward);

            return res.status(200).json({ message: "Reward updated successfully.", old_reward });
        }
        else {
            // There is no reward with this ID.
            return res.status(404).json({ error: `Reward ${rewardID} not found for user` });
        }
    }
    catch (err){
        if (err instanceof SqliteError) {
            return res.status(500).json({ 
                error: `Database error ${err.code}: ${err.message}`
            }); 
        }
        console.log(err);
        return res.status(500).json({ 
            error: `Internal Server error`
        }); 
    }

}

/**
 * PUT route for updating the contents of a reward. Assumes valid auth, :id, and JSON contents
 * given by requireAuth, validateID, and validateUpdateReward.
 */
export async function updateReward(req: Request, res: Response) {
    let user = req.session.user;
    let rewardIDstring = req.params.id;
    const { name, description, value, completions } = req.body;

    let rewardID = parseInt(rewardIDstring);
 
    // The try catch is necessary as all database operations may return SQLite errors
    try {
        // We get the reward for the user
        let old_reward = await rewardTable.getRewardForUser(user?.userID || -1, rewardID);
        // if it exists, we update that record with the parameters from JSON
        if (old_reward) {
            old_reward.name = name;
            old_reward.description = description;
            old_reward.value = value;
            old_reward.completions = completions;
            rewardTable.updateReward(rewardID, old_reward);
            return res.status(200).json({ message: "Reward updated successfully.", old_reward });
        }
        else {
            return res.status(404).json({ error: `Reward ${rewardID} not found for user` });
        }
    }
    catch (err){
        if (err instanceof SqliteError) {
            return res.status(500).json({ 
                error: `Database error ${err.code}: ${err.message}`
            }); 
        }
        console.log(err);
        return res.status(500).json({ 
            error: `Internal Server error`
        }); 
    }
}


/**
 * DELETE route for deleting a reward from the rewards table. Assumes valid auth, and :id. 
 */
export async function deleteReward(req: Request, res: Response) {
    let user = req.session.user;
    let rewardIDString = req.params.id;

    let rewardID = parseInt(rewardIDString);
 
    // The try catch is necessary as all database operations may return SQLite errors
    try {
        // This acts as a guard to ensure that the user can't delete the rewards of other users
        // even though the data besides the id is not strictly necessary for the deletion
        let old_reward = await rewardTable.getRewardForUser(user?.userID || -1, rewardID);
        if (old_reward) {
            rewardTable.deleteReward(rewardID);
            return res.status(200).json({ message: "Reward deleted successfully.", old_reward });
        }
        else {
            return res.status(404).json({ error: `Reward ${rewardID} not found for user` });
        }
    }
    catch (err){
        if (err instanceof SqliteError) {
            return res.status(500).json({ 
                error: `Database error ${err.code}: ${err.message}`
            }); 
        }
        return res.status(500).json({ 
            error: `Internal Server error`
        }); 
    }
}

/**
 * GET route for returning a reward from the rewards table. Assumes valid auth, and :id. 
 */
export async function getRewardByID(req: Request, res: Response) {
    let user = req.session.user;
    let rewardIDString = req.params.id;
    let rewardID = parseInt(rewardIDString);

    // The try catch is necessary as all database operations may return SQLite errors
    try {
        // We get the reward
        let reward = await rewardTable.getRewardForUser(user?.userID || -1, rewardID);
        if (reward) {
            // Return the javascript object as JSON
            res.json(reward);
        }
        else {
            return res.status(404).json({ error: `Reward ${rewardID} not found for user` });
        }
    }
    catch (err){
        if (err instanceof SqliteError) {
                return res.status(500).json({ 
                    error: `Database error ${err.code}: ${err.message}`
                }); 

            }
        }

}

