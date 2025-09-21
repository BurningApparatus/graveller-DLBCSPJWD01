import { User } from '../../models/userModel'
import { UserTable } from '../../repositories/userTable'
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
export class SQLiteUserTable implements UserTable {
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

    async getByID(id: number): Promise<User | null> {
        let statement = this.db.prepare(`SELECT * from users WHERE userID = ?`);

        // return a user via the toUserChecked function. If the user doesn't exist
        // or is malformed a null is returned.
        return toUserChecked(statement.get(id));

    }

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

    async getByName(name: string): Promise<User | null> {
        let statement = this.db.prepare(`SELECT * from users WHERE name = ?`);
        return toUserChecked(statement.get(name)); 
    }

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

