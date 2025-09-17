import { Reward } from '../../models/rewardModel'
import { RewardTable } from '../../repositories/rewardTable'
import { Database } from 'better-sqlite3'

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
export class SQLiteRewardTable implements RewardTable {
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
