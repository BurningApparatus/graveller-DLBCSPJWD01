
import { userTable } from '../db/sqlite'
import { SqliteError } from "better-sqlite3";


import { Request, Response } from "express";
import bcrypt from "bcrypt"

const saltRounds = 10;


export function validateUserRegister(req: Request, res: Response, next: Function) {
    if (req.body == undefined) {
        return res.status(400).json({ error: "no JSON body given" });
    }
    const { username, password } = req.body;


    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "invalid types for username/password" });
    }

    next();
}

export async function registerUser(req: Request, res: Response) {
    // we assume its all good, because of the middleware LOL
    const { username, password } = req.body;

    try {
        let hash = await bcrypt.hash(password, saltRounds);
        let newUser = await userTable.createUser(username, hash);
        res.json({ message: "User registered!", user: newUser });
    }
    catch (err){
        if (err instanceof SqliteError) {
            if (err.code == "SQLITE_CONSTRAINT_UNIQUE") {
                return res.status(400).json({ error: "Username already exists" });
            }
            else {
                return res.status(400).json({ error: `Database error ${err.code}: ${err.message}` });

            }
        }

    }
}


export async function loginUser(req: Request, res: Response) {
    // this function also uses the middleware, so this should be safe to run
    const { username, password } = req.body;

    let user = await userTable.getByName(username);

    if (user) {
        let result = await bcrypt.compare(password, user.passwordHash);
        if (result) {
            // Yipee
            req.session.user = user;
            console.log(req.session);

            req.session.save(err => {
                if (err) console.error(err)
                res.json({ message: "you logged in lmao"});
            })
        }
        else {
            res.json({ message: "Incorrect password for user"});
        }
    }
    else { 
        return res.status(400).json({ error: `User doesn't exist! Try registering first` });
    }

}


export async function logoutUser(req: Request, res: Response) {
    req.session.destroy((err) => {
        if (err) return res.status(500).send("Error logging out.");
        res.clearCookie("connect.sid"); 
        res.json({ message: "you logged out!"});
    });
}

export async function getUserInfo(req: Request, res: Response) {
    let user = req.session.user;


    console.log(req.session);
    if (user) {
        res.json({ username: user.name, balance: user.balance });
    }
    else {
        return res.status(400).json({ error: `You are not logged in.` });

    }

}

// This is a debugging function AND SHOULD NOT BE USED
export async function listUsers(_req: Request, res: Response) { 
    res.json(await userTable.getAll());
}
