import { Reward } from '../../models/rewardModel'
import { RewardTable } from '../../repositories/rewardTable'
import { Database } from 'better-sqlite3'

/**
 * Safely Converts an row with any type into a type that typescript understands.
 * 
 * @returns A Reward Object if the row is well formed, and null otherwise.
 */
function toRewardChecked(row: any): Reward | null {

    // Check if the row is not undefined/null
    if (!row) {
        return null;
    }
    // We check if all row attributes exist and are of the right type
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

/**
 * Class which represents an interface for the Reward table for SQLite.
 * implements the RewardTable interface defined in /repositories/rewardTable.ts
 */
export class SQLiteRewardTable implements RewardTable {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Create the table if it doesn't already exist
     */
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

        // create a row in the database from the given data
        let statement = this.db.prepare(`INSERT INTO rewards(userID, name, description, completions, value) values(?,?,?,?,?)`);

        let info = statement.run(
            reward.userID, 
            reward.name, 
            reward.description, 
            0, // completions defaults to 0.
            reward.value
        );

        console.log(info);


        // Returning the rowID of the newly inserted object to be returned
        let rowID = info.lastInsertRowid;

        let newReward = reward;
        newReward.rewardID = rowID as number;

        return newReward;

    }

    async getByID(id: number): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE rewardID = ?`);
        // return A reward via the toRewardChecked function. If the reward doesn't exist
        // or is malformed a null is returned.
        return toRewardChecked(statement.get(id));
    }

    async getAll(): Promise<Reward[]> {
        let statement = this.db.prepare(`SELECT * from rewards`);
        // the all() method returns an array of records which satisfy the query
        let res = statement.all();
        
        // If no such records are found, return []
        if (!res) {
            return [];
        }

        // Then, we just map each row to a Reward object
        return res.map((potential_reward: any) => {
            if (toRewardChecked(potential_reward)) {
                return potential_reward
            } 
        })

    }

    async getByName(name: string): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE name = ?`);
        // return A reward via the toRewardChecked function. If the reward doesn't exist
        // or is malformed a null is returned.
        return toRewardChecked(statement.get(name)); 
    }

    updateReward(id: number, newReward: Reward): void {
        // update a row in the database from the given data
        let statement = this.db.prepare(`
            UPDATE rewards SET userID = ?, name = ?, description = ?, completions = ?, value = ? WHERE rewardID = ?`
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
        // Delete reward with ID
        let statement = this.db.prepare(`DELETE FROM rewards WHERE rewardID = ?`);
        let info = statement.run(id);

        // This should trip if the ID isn't in the database, but should be avoided
        // by the caller
        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 

    async getRewardForUser(userID: number, rewardID: number): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE rewardID = ? AND userID = ?;`);
        return toRewardChecked(statement.get(rewardID, userID));
    }

    async getRewardsForUser(userID: number): Promise<Reward[]> {
        // functions in the same way as getRewards, except with the extra WHERE clause
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
