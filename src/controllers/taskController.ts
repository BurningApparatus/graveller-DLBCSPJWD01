
import { taskTable, userTable } from '../db/sqlite3/db'

import { Request, Response } from "express"
import { SqliteError } from "better-sqlite3";

export function validateNewTask(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, due, value } = req.body;


    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof due !== "number" ||
        typeof value !== "number" 
    ) {
        return res.status(400).json({ error: "invalid types for new task" });
    }

    next();
}

export function validateTaskUpdate(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, due, value, completed } = req.body;


    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof due !== "number" ||
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
    const taskID = parseInt(req.params.id, 10);
    if (isNaN(taskID)) {
        return res.status(400).json({ error: "Task ID must be a number." });
    }
    req.params.id = taskID.toString(); // store parsed ID back
    next();
}



export async function newTask(req: Request, res: Response) {
    // we assume its all good, because of the middleware LOL
    const { name, description, due, value } = req.body;
    let user = req.session.user;

    console.log(req.session);
    if (!user) {
        return res.status(400).json({ error: `You are not logged in.` });
    }

    try {
        let _newTask = await taskTable.createTask({
            taskID: -1,
            userID: user?.userID || -1, // This is fine because of the requireAuth middleware
            name: name,
            description: description,
            due: new Date(due),
            value: value,
            completed: false,
        });
        res.json({ message: "Task added", task: {
            name: name,
            description: description,
            due: new Date(due),
            value: value,
            completed: false
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


export async function getTasks(req: Request, res: Response) {
    let user = req.session.user;
    try {
        let tasks = await taskTable.getTasksForUser(user?.userID || -1);
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

export async function completeTask(req: Request, res: Response) {
    let userID = req.session.user?.userID || -1;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    try {
        let old_task = await taskTable.getTaskForUser(userID, taskID);
        let current_user = await userTable.getByID(userID);
        if (old_task) {

            // We also add balance to the current user
            if (!current_user) {
                // Whatever this scenario is, refreshing the cookie should fix it.
                return res.status(500).json({ 
                    error: `Error getting user information. Please log in again`
                }); 
            }
            if (!old_task.completed) {
                current_user.balance += old_task.value;
                userTable.updateUser(userID, current_user);
            }
            old_task.completed = true;
            taskTable.updateTask(taskID, old_task);

            return res.status(200).json({ message: "Task updated successfully.", old_task });
        }
        else {
            return res.status(404).json({ error: `Task ${taskID} not found for user` });
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

export async function uncompleteTask(req: Request, res: Response) {
    let userID = req.session.user?.userID || -1;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    try {
        let old_task = await taskTable.getTaskForUser(userID, taskID);
        let current_user = await userTable.getByID(userID);
        if (old_task) {

            // We also subtract balance from the current user
            if (!current_user) {
                // Whatever this scenario is, refreshing the cookie should fix it.
                return res.status(500).json({ 
                    error: `Error getting user information. Please log in again`
                }); 
            }
            if (old_task.completed) {
                current_user.balance -= old_task.value;
                userTable.updateUser(userID, current_user);
            }
            old_task.completed = false;
            taskTable.updateTask(taskID, old_task);
            return res.status(200).json({ message: "Task updated successfully.", old_task });
        }
        else {
            return res.status(404).json({ error: `Task ${taskID} not found for user` });
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

export async function updateTask(req: Request, res: Response) {
    let user = req.session.user;
    let taskIDString = req.params.id;
    const { name, description, due, value, completed } = req.body;

    let taskID = parseInt(taskIDString);
 
    try {
        let old_task = await taskTable.getTaskForUser(user?.userID || -1, taskID);
        if (old_task) {
            old_task.name = name;
            old_task.description = description;
            old_task.due = new Date(due);
            old_task.value = value;
            old_task.completed = completed;
            taskTable.updateTask(taskID, old_task);
            return res.status(200).json({ message: "Task updated successfully.", old_task });
        }
        else {
            return res.status(404).json({ error: `Task ${taskID} not found for user` });
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


export async function deleteTask(req: Request, res: Response) {
    let user = req.session.user;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    try {
        let old_task = await taskTable.getTaskForUser(user?.userID || -1, taskID);
        if (old_task) {
            taskTable.deleteTask(taskID);
            return res.status(200).json({ message: "Task deleted successfully.", old_task });
        }
        else {
            return res.status(404).json({ error: `Task ${taskID} not found for user` });
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

export async function getTaskByID(req: Request, res: Response) {
    let user = req.session.user;
    let taskIDString = req.params.id;
    let taskID = parseInt(taskIDString);

    try {
        let task = await taskTable.getTaskForUser(user?.userID || -1, taskID);
        if (task) {
            res.json(task);
        }
        else {
            return res.status(404).json({ error: `Task ${taskID} not found for user` });
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

