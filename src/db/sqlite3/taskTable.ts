import { Task } from '../../models/taskModel'
import { TaskTable } from '../../repositories/taskTable'
import { Database } from 'better-sqlite3'

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

export class SQLiteTaskTable implements TaskTable {
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
