import { User } from '../models/userModel'
import { Task } from '../models/taskModel'
import { Reward } from '../models/rewardModel'
import { UserTable } from '../repositories/userTable'
import { TaskTable } from '../repositories/taskTable'
import { RewardTable } from '../repositories/rewardTable'
import DatabaseConstructor, {Database} from "better-sqlite3";

//const db: Database = new DatabaseConstructor("../graveller.db");

export const db = new DatabaseConstructor('./graveller.db', { verbose: console.log });


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

class SQLiteUserTable implements UserTable {
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
export const userTable = new SQLiteUserTable(db);


function toTaskChecked(row: any): Task | null {

    if (!row) {
        return null;
    }
    if (typeof row.taskID == 'number' && 
        typeof row.userID == 'number' && 
        typeof row.name == 'string' && 
        typeof row.description == 'string' &&
        typeof row.completed == 'number' &&
        typeof row.value == 'number'
    ) {
        return {
            taskID: row.taskID,
            userID: row.userID,
            name: row.name,
            description: row.description,
            due: new Date(row.due),
            completed: row.completed,
            value: row.value,
        }
        
    }
    else {
        return null;
    }
}

class SQLiteTaskTable implements TaskTable {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    migrate(): void {

        // NOTE: SQLite doesn't have types for boolean or datetime (https://sqlite.org/datatype3.html)
        // completed is a boolean type, represented by Integer 0 and 1
        // due is a datetime type, represented in UNIX time by an integer
        let statement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS tasks(
                taskID INTEGER PRIMARY KEY AUTOINCREMENT,
                userID INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                completed INTEGER NOT NULL,
                due INTEGER NOT NULL,
                value INTEGER NOT NULL,
                FOREIGN KEY (userID)
                REFERENCES users (userID)
            );`
        );
        statement.run();
    }    

    async createTask(task: Task): Promise<Task> {
        console.log(task);

        let statement = this.db.prepare(`INSERT INTO tasks(userID, name, description, completed, due, value) values(?,?,?,?,?,?)`);

        let info = statement.run(task.userID, 
            task.name, 
            task.description, 
            0, 
            task.due.getTime(),
            task.value
        );

        console.log(info);


        let rowID = info.lastInsertRowid;

        let newTask = task;
        // dangerous!
        newTask.taskID = rowID as number;

        return newTask;

    }

    async getByID(id: number): Promise<Task | null> {
        let statement = this.db.prepare(`SELECT * from tasks WHERE taskID = ?`);
        return toTaskChecked(statement.get(id));


    }

    async getAll(): Promise<Task[]> {
        let statement = this.db.prepare(`SELECT * from tasks`);
        let res = statement.all();

        if (!res) {
            return [];
        }
        return res.map((potential_user: any) => {
            if (toTaskChecked(potential_user)) {
                return potential_user
            } 
        })

    }

    async getByName(name: string): Promise<Task | null> {
        let statement = this.db.prepare(`SELECT * from tasks WHERE name = ?`);
        return toTaskChecked(statement.get(name)); 
    }

    updateTask(id: number, newTask: Task): void {
        let statement = this.db.prepare(`
            UPDATE tasks SET userID = ?, name = ?, description = ?, due = ?, completed = ?, value = ? WHERE taskID = ?`
        );
        let info = statement.run(
            newTask.userID, 
            newTask.name, 
            newTask.description, 
            newTask.due.getTime(),
            Number(newTask.completed),
            newTask.value,
            id
        );

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }


    }

    deleteTask(id: number): void {
        let statement = this.db.prepare(`DELETE FROM tasks WHERE taskID = ?`);
        let info = statement.run(id);

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 

    async getTaskForUser(userID: number, taskID: number): Promise<Task | null> {
        let statement = this.db.prepare(`SELECT * from tasks WHERE taskID = ? AND userID = ?;`);
        return toTaskChecked(statement.get(taskID, userID));
    }

    async getTasksForUser(userID: number): Promise<Task[]> {
        let statement = this.db.prepare(`SELECT * from tasks WHERE userID = ?`);
        let res = statement.all(userID);

        if (!res) {
            return [];
        }
        return res.map((potential_task: any) => {
            if (toTaskChecked(potential_task)) {
                return potential_task
            } 
        })
        //return res.map((potential_task: any) => {return potential_task});

    }
}

export const taskTable = new SQLiteTaskTable(db);
function toRewardChecked(row: any): Reward | null {

    if (!row) {
        return null;
    }
    if (typeof row.rewardID == 'number' && 
        typeof row.userID == 'number' && 
        typeof row.name == 'string' && 
        typeof row.description == 'string' &&
        typeof row.completions == 'number' &&
        typeof row.value == 'number'
    ) {
        return {
            rewardID: row.rewardID,
            userID: row.userID,
            name: row.name,
            description: row.description,
            completions: row.completions,
            value: row.value,
        }
        
    }
    else {
        return null;
    }
}
class SQLiteRewardTable implements RewardTable {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    migrate(): void {

        let statement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS rewards(
                rewardID INTEGER PRIMARY KEY AUTOINCREMENT,
                userID INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                completions INTEGER NOT NULL,
                value INTEGER NOT NULL,
                FOREIGN KEY (userID)
                REFERENCES users (userID)
            );`
        );
        statement.run();
    }    

    async createReward(reward: Reward): Promise<Reward> {

        let statement = this.db.prepare(`INSERT INTO rewards(userID, name, description, completions, value) values(?,?,?,?,?)`);

        let info = statement.run(
            reward.userID, 
            reward.name, 
            reward.description, 
            0, 
            reward.value
        );

        console.log(info);


        let rowID = info.lastInsertRowid;

        let newReward = reward;
        newReward.rewardID = rowID as number;

        return newReward;

    }

    async getByID(id: number): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE rewardID = ?`);
        return toRewardChecked(statement.get(id));
    }

    async getAll(): Promise<Reward[]> {
        let statement = this.db.prepare(`SELECT * from rewards`);
        let res = statement.all();

        if (!res) {
            return [];
        }
        return res.map((potential_reward: any) => {
            if (toRewardChecked(potential_reward)) {
                return potential_reward
            } 
        })

    }

    async getByName(name: string): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE name = ?`);
        return toRewardChecked(statement.get(name)); 
    }

    updateReward(id: number, newReward: Reward): void {
        let statement = this.db.prepare(`
            UPDATE tasks SET userID = ?, name = ?, description = ?, completions = ?, value = ? WHERE rewardID = ?`
        );
        let info = statement.run(
            newReward.userID, 
            newReward.name, 
            newReward.description, 
            newReward.completions,
            newReward.value,
            id
        );

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }


    }

    deleteReward(id: number): void {
        let statement = this.db.prepare(`DELETE FROM rewards WHERE rewardID = ?`);
        let info = statement.run(id);

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 

    async getRewardForUser(userID: number, rewardID: number): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE rewardID = ? AND userID = ?;`);
        return toRewardChecked(statement.get(rewardID, userID));
    }

    async getRewardsForUser(userID: number): Promise<Reward[]> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE userID = ?`);
        let res = statement.all(userID);

        if (!res) {
            return [];
        }
        return res.map((potential_reward: any) => {
            if (toRewardChecked(potential_reward)) {
                return potential_reward
            } 
        })

    }
}
export const rewardTable = new SQLiteRewardTable(db);
