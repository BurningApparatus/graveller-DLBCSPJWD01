import { User } from '../../models/userModel'
import { Database } from "better-sqlite3";

/**
 * Safely Converts a row with any type into a type that typescript understands.
 * 
 * @returns A User Object if the row is well formed, and null otherwise.
 */
function toUserChecked(row: any): User | null {

    if (!row) {
        return null;
    }
    if (typeof row.userID == 'number' && 
        typeof row.name == 'string' && 
        typeof row.passwordHash == 'string' && 
        typeof row.balance == 'number'
    ) {
        return {
            userID: row.userID as number,
            name: row.name,
            passwordHash: row.passwordHash,
            balance: row.balance,
        }
        
    }
    else {
        return null;
    }
}

/**
 * Class which represents an interface for the Task table for SQLite.
 * implements the TaskTable interface defined in /repositories/taskTable.ts
 */
export class SQLiteUserTable {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Create the table if it doesn't already exist
     */
    migrate(): void {
        let statement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS users(
                userID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                passwordHash TEXT NOT NULL,
                balance INTEGER NOT NULL
            );`
        );
        statement.run();
    }    

    /**
     * Creates a User in the user table with the following name and password
     * errors (such as non-unique username) may be thrown and must be handled by 
     * the controller function
     */
    async createUser(name: string, password: string): Promise<User> {
        let statement = this.db.prepare(`INSERT INTO users(name, passwordHash, balance) values(?, ?, ?)`);
        // insert relevant properites into a record in the table
        // the hashing of the password is handled by the calling function.
        let info = statement.run(name, password, 0);


        let rowID = info.lastInsertRowid;

        return {
            userID: rowID as number,
            name: name,
            passwordHash: password,
            balance: 0,
        };

    }

    /**
     * Returns a user from a given ID. Returns null if there is no user with the 
     * specified ID
     */
    async getByID(id: number): Promise<User | null> {
        let statement = this.db.prepare(`SELECT * from users WHERE userID = ?`);

        // return a user via the toUserChecked function. If the user doesn't exist
        // or is malformed a null is returned.
        return toUserChecked(statement.get(id));

    }

    /**
     * Returns all users in the table in an array.
     */
    async getAll(): Promise<User[]> {
        let statement = this.db.prepare(`SELECT * from users`);

        // the all() method returns an array of records which satisfy the query
        let res = statement.all();

        // If no such records are found, return []
        if (!res) {
            return [];
        }
        // Then, we just map each row to a User object
        return res.map((potential_user: any) => {
            if (toUserChecked(potential_user)) {
                return potential_user
            } 
        })

    }

    /**
     * Returns a user from a given name. Returns null if there is no user with the 
     * specified name. Case sensitive.
     */
    async getByName(name: string): Promise<User | null> {
        let statement = this.db.prepare(`SELECT * from users WHERE name = ?`);
        return toUserChecked(statement.get(name)); 
    }

    /**
     * Updates the user of a given ID with new Row Data. 
     *
     * @param id The id of the user to change
     * @param newUser the information of the new user to be inserted, except the userID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateUser(id: number, newUser: User): void {


        // update a row in the database from the given data
        let statement = this.db.prepare(`
            UPDATE users 
                SET     name = ?, 
                        passwordHash = ?, 
                        balance = ? 
                 WHERE  userID = ?`
        );
        let info = statement.run(newUser.name, newUser.passwordHash, newUser.balance, id);

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }


    }

    /**
     * Delete the user of a specified id. Throws an error if there is no such user.
     */
    deleteUser(id: number): void {
        // Delete user with ID
        let statement = this.db.prepare(`DELETE FROM users WHERE userID = ?`);
        let info = statement.run(id);

        // This should trip if the ID isn't in the database, but should be avoided
        // by the caller
        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 
}

