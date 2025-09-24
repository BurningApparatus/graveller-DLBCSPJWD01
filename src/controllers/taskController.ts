
import { taskTable, userTable, transactionTable } from '../db/sqlite3/db'

import { Request, Response } from "express"
import { SqliteError } from "better-sqlite3";

/**
 * Middleware function for validating the JSON body for the New Task API call
 */
export function validateNewTask(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, due, value } = req.body;


    // We validate the JSON by checking if the correct fields exist and have the correct type.
    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof due !== "number" ||
        typeof value !== "number" 
    ) {
        return res.status(400).json({ error: "invalid types for new task" });
    }

    // Once we know that req.body is valid, we can pass to another function with
    // the assurance that all fields are present and correct.
    next();
}

/**
 * Middleware function for validating the JSON body for the Update Task API call
 */
export function validateTaskUpdate(req: Request, res: Response, next: Function) {

    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { name, description, due, value, completed } = req.body;


    // We validate the JSON by checking if the correct fields exist and have the correct type.
    if (
        typeof name !== "string" || 
        typeof description !== "string" ||
        typeof due !== "number" ||
        typeof value !== "number" ||
        typeof completed !== "boolean"
    ) {
        return res.status(400).json({ error: "invalid types for task update" });
    }

    // Once we know that req.body is valid, we can pass to another function with
    // the assurance that all fields are present and correct.
    next();
}
export function requireAuth(req: Request, res: Response, next: Function) {

    // The session cookie stores a User Object if the user is logged in.
    let user = req.session.user;
    console.log(req.session);

    // Essentially, this middleware only serves to ensure that this cookie exists
    // in the browser.
    if (!user) {
        return res.status(401).json({ error: `You are not logged in.` });
    }
    next();
}

export function validateID(req: Request, res: Response, next: Function) {

    // Get the :id value from the request and attempt to parse it to an Integer
    const taskID = parseInt(req.params.id, 10);
    // If it isn't valid, we return an error
    if (isNaN(taskID)) {
        return res.status(400).json({ error: "Task ID must be a number." });
    }
    // store parsed ID back
    req.params.id = taskID.toString(); 
    next();
}



/** 
 * POST Route for delcaring a new Task. 
 * Assumes auth and validateNewTask middleware are passed.
 */
export async function newTask(req: Request, res: Response) {
    // We take relevant fields from the given JSON body
    const { name, description, due, value } = req.body;
    let user = req.session.user;

    if (value < 0) {
        return res.status(400).json({ error: "Value must be non-negative" });
    }

    // The try catch is necessary as all database operations may return SQLite errors
    try {
        // We create a task using the relevant parameters
        let _newTask = await taskTable.createTask({
            taskID: -1,
            userID: user?.userID || -1, // This is fine because of the requireAuth middleware
            name: name,
            description: description,
            // The function expects the JSON body to be UNIX time-stamp, so we convert to date
            due: new Date(due), 
            value: value,
            completed: false,
            deleted: false,
        });
        // We send back useful information to the client
        res.json({ success: true, message: "Task added", task: {
            name: name,
            description: description,
            due: new Date(due),
            value: value,
            completed: false
        } });
    }
    catch (err){
        // the better-sqlite3 library returns SqliteError
        if (err instanceof SqliteError) {
                return res.status(500).json({ 
                    error: `Database error ${err.code}: ${err.message}`
                }); 
        }
        else {
            console.log(err)
                return res.status(500).json({ 
                    error: `Internal Server error`
                }); 

        }
    }

}


/**
 * GET route for getting all tasks for a user. Requires auth.
 */
export async function getTasks(req: Request, res: Response) {
    // We need the userID of the current logged in user
    let user = req.session.user;

    // The try catch is necessary as all database operations may return SQLite errors
    try {
        let tasks = await taskTable.getTasksForUser(user?.userID || -1);
        console.log(tasks);
        // getTasksForUser returns an array of javascript objects, which
        // can be converted to JSON.
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

/**
 * PUT route for completing a task for a user. 
 * Sets the "completed" field on the task to true.
 * Has a side-effect of directly updating the balance of the user, 
 * and adds an entry to the transasction table. 
 *
 * Expects valid auth and :id.
 */
export async function completeTask(req: Request, res: Response) {
    // we get the user and task ID
    let userID = req.session.user?.userID || -1;
    let taskIDString = req.params.id;
    let taskID = parseInt(taskIDString);
 
    // The try catch is necessary as all database operations may return SQLite errors
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
            // If they try to "complete" a completed task, nothing should happen
            if (!old_task.completed) {
                // We add the balance;
                current_user.balance += old_task.value;
                userTable.updateUser(userID, current_user);
                // We add a transaction for the current date
                transactionTable.createTransaction({
                    transactionID: -1,
                    userID: userID,
                    amount: old_task.value,
                    date: new Date(),
                })

            }
            // All that's left is to set the completed field and update the database
            old_task.completed = true;
            taskTable.updateTask(taskID, old_task);

            return res.status(200).json({ message: "Task updated successfully.", task: old_task });
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

/**
 * PUT route for un-completing a task for a user. 
 * Sets the "completed" field on the task to false.
 * Has a side-effect of directly updating the balance of the user, 
 * and adds an entry to the transasction table. 
 *
 * Expects valid auth and :id.
 */
export async function uncompleteTask(req: Request, res: Response) {

    // we get the user and task ID
    let userID = req.session.user?.userID || -1;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    // The try catch is necessary as all database operations may return SQLite errors
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

            // If they try to "uncomplete" a uncompleted task, nothing should happen
            if (old_task.completed) {
                current_user.balance -= old_task.value;
                userTable.updateUser(userID, current_user);

                // We add a transaction for the current date
                transactionTable.createTransaction({
                    transactionID: -1,
                    userID: userID,
                    amount: -old_task.value,
                    date: new Date(),
                })
            }
            old_task.completed = false;
            taskTable.updateTask(taskID, old_task);
            return res.status(200).json({ message: "Task updated successfully.", task: old_task });
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

/**
 * PUT route for refreshing a task for a user. 
 * Sets the "completed" field on the task to false.
 * Has no side effects, unlike uncomplete task, meaning that a user may reuse a task
 *
 * Expects valid auth and :id.
 */
export async function refreshTask(req: Request, res: Response) {

    // we get the user and task ID
    let userID = req.session.user?.userID || -1;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    // The try catch is necessary as all database operations may return SQLite errors
    try {
        let old_task = await taskTable.getTaskForUser(userID, taskID);
        if (old_task) {

            old_task.completed = false;
            taskTable.updateTask(taskID, old_task);
            return res.status(200).json({ message: "Task updated successfully.", task: old_task });
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
/**
 * PUT route for updating the contents of a task. Assumes valid auth, :id, and JSON contents
 * given by requireAuth, validateID, and validateTaskUpdate
 */
export async function updateTask(req: Request, res: Response) {
    // We get user info from session cookie and task info from URL
    let user = req.session.user;
    let taskIDString = req.params.id;
    // The validateTaskUpdate function ensures this is safe
    const { name, description, due, value, completed } = req.body;

    let taskID = parseInt(taskIDString);
 
    try {
        // we get the specific task for the user. Important to not let a logged in user
        // update the task of anothere
        let old_task = await taskTable.getTaskForUser(user?.userID || -1, taskID);
        if (old_task) {
            // if it exists, set each attribute, and then update it back
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


/**
 * DELETE route for deleting task from the tasks table. 
 * Assumes valid auth, :id, and JSON contents
 * given by requireAuth, validateID, and validateTaskUpdate
 */
export async function deleteTask(req: Request, res: Response) {
    let user = req.session.user;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    try {
        // we get the task
        let old_task = await taskTable.getTaskForUser(user?.userID || -1, taskID);
        if (old_task) {
            // if it exists, we delete it from the database
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

/**
 * PUT route for restoring a deleted task from the tasks table. 
 * Assumes valid auth, :id, and JSON contents
 * given by requireAuth, validateID, and validateTaskUpdate
 */
export async function restoreTask(req: Request, res: Response) {
    let user = req.session.user;
    let taskIDString = req.params.id;

    let taskID = parseInt(taskIDString);
 
    try {
        // we get the task
        let old_task = await taskTable.getTaskForUser(user?.userID || -1, taskID, true);
        if (old_task) {
            // if it exists, we delete it from the database
            taskTable.restoreTask(taskID);
            return res.status(200).json({ message: "Task restored successfully.", old_task });
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

/**
 * GET route for getting a particular task for a user. Requires auth and validateID
 */
export async function getTaskByID(req: Request, res: Response) {
    let user = req.session.user;
    let taskIDString = req.params.id;
    let taskID = parseInt(taskIDString);

    try {
        let task = await taskTable.getTaskForUser(user?.userID || -1, taskID);
        if (task) {
            // if the task exists for the user, we return it as JSON
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
        return res.status(500).json({ 
            error: `Internal Server error`
        }); 

}

