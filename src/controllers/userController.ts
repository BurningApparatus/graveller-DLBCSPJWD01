
import { userTable, transactionTable } from '../db/sqlite3/db'
import { SqliteError } from "better-sqlite3";


import { Request, Response } from "express";
import bcrypt from "bcrypt"

const saltRounds = 10;

/**
 * Middleware function to validate JSON body for registering a new user
 */
export function validateUserRegister(req: Request, res: Response, next: Function) {
    // We check if the body exists
    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { username, password } = req.body;

    // We verify valid JSON by testing if the fields exist on the JSON and are of the 
    // correct type
    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "invalid types for username/password" });
    }

    next();
}

/**
 * POST request for registering a user. requires validateUserRegister auth
 */
export async function registerUser(req: Request, res: Response) {
    // we assume its all good, because of the middleware 
    const { username, password } = req.body;

    try {
        // We hash the incoming password in the JSON payload
        let hash = await bcrypt.hash(password, saltRounds);
        // Then, we can create a User with the username and hased password
        let newUser = await userTable.createUser(username, hash);
        
        // we save the user session cookie (to log in)
        req.session.user = newUser;
        req.session.save(err => {
            if (err) console.error(err)
            res.json({ success: true, message: "User registered!", user: newUser });
        })
    }
    catch (err){
        if (err instanceof SqliteError) {
            // This is a special case for a duplicate username. 
            // The SQLite table has a UNIQUE constraint on the username field
            if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
                res.json({ success: false, message: "User already exists. Please log in!"});
            }
            else {
                return res.status(500).json({ error: `Database error ${err.code}: ${err.message}` });

            }
        }

    }
}



/**
 * POST request for logging in, uses the same validateUserRegister middleware for its JSON body
 */
export async function loginUser(req: Request, res: Response) {
    // this function also uses the middleware, so this should be safe to run
    const { username, password } = req.body;

    // We get the user by the specified name in the request
    let user = await userTable.getByName(username);

    if (user) {
        // bcrypt.compare is used to check the password against the hashed one in the database
        let result = await bcrypt.compare(password, user.passwordHash);
        if (result) {
            // successful login, save the session in a cookie
            req.session.user = user;
            console.log(req.session);

            req.session.save(err => {
                if (err) console.error(err)
                res.json({ success: true, message: "you logged in lmao"});
            })
        }
        else {
            // unsuccessful login, password must be incorrect
            res.json({ success: false, message: "Incorrect password for user"});
        }
    }
    else { 
        // The username wasn't found in the database
        res.json({ success: false, message: "User Doesn't exist"});
    }

}


/**
 * DELETE request for a user. requires auth.
 */
export async function deleteUser(req: Request, res: Response) {

    let user = req.session.user;

    console.log(req.session);
    if (user) {
        // Deletes the user
        userTable.deleteUser(user.userID);
        // Also logs them out to prevent odd errors
        req.session.destroy((err) => {
            if (err) return res.status(500).send("Error logging out.");
            res.clearCookie("connect.sid"); 
            res.json({ message: "User deleted successfully"});
        });
    }
    else {
        return res.status(400).json({ error: `You are not logged in.` });

    }

}

/**
 * POST request for logging a user out. Requires auth
 */
export async function logoutUser(req: Request, res: Response) {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Error logging out.");
        res.clearCookie("connect.sid"); 
        res.json({ message: "you logged out!"});
    });
}

/**
 * GET request for getting a user's information (just the username and balance)
 */
export async function getUserInfo(req: Request, res: Response) {
    // get user ID from session
    let user = req.session.user;

    if (user) {
        // We get the information from the table
        let out = await userTable.getByID(user.userID);
        // If the user exists, return relevant information
        if (out) {
            res.json({ username: out.name, balance: out.balance });
        }
        else {
            return res.status(500).json({ error: `An error occurred. Please log in again.` });
        }

    }
    else {
        return res.status(400).json({ error: `You are not logged in.` });

    }

}

/**
 * GET request for getting a user's activity for the past 7 days
 */
export async function getUserStats(req: Request, res: Response) {
    // get user ID from session
    let user = req.session.user;

    if (user) {
        // We get the information from the table
        let out = await userTable.getByID(user.userID);
        // If the user exists, return relevant information
        if (out) {
            //res.json({ username: out.name, balance: out.balance });
            // we get them stats
            let one_week = 7 * 24 * 60 * 60 * 1000;
            try {
                let stats = await transactionTable.getUserTransactionSummary(
                    user.userID, 
                    new Date( Date.now() - one_week)
                );
                res.json(stats);
            }
            catch (err) {
                if (err instanceof SqliteError) {
                    return res.status(500).json({ 
                        error: `Database error ${err.code}: ${err.message}` }
                    );
                }
                console.log(err);
                return res.status(500).json({ 
                    error: `Internal Server error` }
                );
            }
        }
        else {
            return res.status(500).json({ error: `An error occurred. Please log in again.` });
        }

    }
    else {
        return res.status(400).json({ error: `You are not logged in.` });

    }

}
// This is a debugging function AND SHOULD NOT BE USED
export async function listUsers(_req: Request, res: Response) { 
    res.json(await userTable.getAll());
}
