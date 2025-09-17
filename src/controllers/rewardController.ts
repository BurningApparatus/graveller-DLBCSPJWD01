

import { rewardTable, userTable } from '../db/sqlite3/db'

import { Request, Response } from "express"
import { SqliteError } from "better-sqlite3";

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

export function validateUpdateReward(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, value, completed } = req.body;


    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof value !== "number" ||
        typeof completed !== "boolean"
    ) {
        return res.status(400).json({ error: "invalid types for task update" });
    }

    next();
}
export function requireAuth(req: Request, res: Response, next: Function) {

    let user = req.session.user;
    console.log(req.session);
    if (!user) {
        return res.status(401).json({ error: `You are not logged in.` });
    }
    next();
}

export function validateID(req: Request, res: Response, next: Function) {
    const rewardID = parseInt(req.params.id, 10);
    if (isNaN(rewardID)) {
        return res.status(400).json({ error: "Task ID must be a number." });
    }
    req.params.id = rewardID.toString(); // store parsed ID back
    next();
}



export async function newReward(req: Request, res: Response) {
    // we assume its all good, because of the middleware LOL
    const { name, description, value } = req.body;
    let user = req.session.user;

    console.log(req.session);
    if (!user) {
        return res.status(400).json({ error: `You are not logged in.` });
    }

    try {
        let _newTask = await rewardTable.createReward({
            rewardID: -1,
            userID: user?.userID || -1, // This is fine because of the requireAuth middleware
            name: name,
            description: description,
            value: value,
            completions: 0,
        });
        res.json({ message: "Reward added", task: {
            name: name,
            description: description,
            value: value,
            completions: 0
        } });
    }
    catch (err){
        if (err instanceof SqliteError) {
                return res.status(400).json({ 
                    error: `Database error ${err.code}: ${err.message}`
                }); 

            }
        }

}


export async function getRewards(req: Request, res: Response) {
    let user = req.session.user;
    try {
        let tasks = await rewardTable.getRewardsForUser(user?.userID || -1);
        console.log(tasks);
        res.json(tasks);
    }
    catch (err){
        if (err instanceof SqliteError) {
                return res.status(400).json({ 
                    error: `Database error ${err.code}: ${err.message}`
                }); 

            }
        }

}

export async function completeReward(req: Request, res: Response) {
    let userID = req.session.user?.userID || -1;
    let rewardIDstring = req.params.id;

    let rewardID = parseInt(rewardIDstring );
 
    try {
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
            current_user.balance -= old_reward.value;
            userTable.updateUser(userID, current_user);
            old_reward.completions++;
            rewardTable.updateReward(rewardID, old_reward);

            return res.status(200).json({ message: "Task updated successfully.", old_reward });
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

export async function updateReward(req: Request, res: Response) {
    let user = req.session.user;
    let rewardIDstring = req.params.id;
    const { name, description, value, completions } = req.body;

    let rewardID = parseInt(rewardIDstring);
 
    try {
        let old_reward = await rewardTable.getRewardForUser(user?.userID || -1, rewardID);
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


export async function deleteReward(req: Request, res: Response) {
    let user = req.session.user;
    let rewardIDString = req.params.id;

    let rewardID = parseInt(rewardIDString);
 
    try {
        let old_task = await rewardTable.getRewardForUser(user?.userID || -1, rewardID);
        if (old_task) {
            rewardTable.deleteReward(rewardID);
            return res.status(200).json({ message: "Task deleted successfully.", old_task });
        }
        else {
            return res.status(404).json({ error: `Task ${rewardID} not found for user` });
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

export async function getRewardByID(req: Request, res: Response) {
    let user = req.session.user;
    let rewardIDString = req.params.id;
    let rewardID = parseInt(rewardIDString);

    try {
        let task = await rewardTable.getRewardForUser(user?.userID || -1, rewardID);
        if (task) {
            res.json(task);
        }
        else {
            return res.status(404).json({ error: `Task ${rewardID} not found for user` });
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

