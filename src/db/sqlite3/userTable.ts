import { User } from '../../models/userModel'
import { UserTable } from '../../repositories/userTable'
import { Database } from "better-sqlite3";

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

export class SQLiteUserTable implements UserTable {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

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
        // TODO: Hash password before storing !!! IMPORTANT !!!
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
        return toUserChecked(statement.get(id));


    }

    async getAll(): Promise<User[]> {
        let statement = this.db.prepare(`SELECT * from users`);
        let res = statement.all();

        if (!res) {
            return [];
        }
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
        let statement = this.db.prepare(`DELETE FROM users WHERE userID = ?`);
        let info = statement.run(id);

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 
}

