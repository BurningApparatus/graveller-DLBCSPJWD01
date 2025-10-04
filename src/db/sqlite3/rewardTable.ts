import { Reward } from '../../models/rewardModel'
import { Database } from 'better-sqlite3'

import { log, error } from '../../utils/logging'

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
        typeof row.value == 'number' &&
        typeof row.deleted == 'number'
    ) {
        return {
            rewardID: row.rewardID,
            userID: row.userID,
            name: row.name,
            description: row.description,
            completions: row.completions,
            value: row.value,
            deleted: row.deleted,
        }
        
    }
    else {
        return null;
    }
}

/**
 * Class which represents an interface for the Reward table for SQLite.
 */
export class SQLiteRewardTable {
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
                deleted INTEGER NOT NULL,
                FOREIGN KEY (userID)
                REFERENCES users (userID) ON DELETE CASCADE
            );`
        );
        statement.run();
    }    

    /**
     * Creates a Reward in the table with the information provided
     * errors may be thrown and must be handled by the controller function
     * The rewardID property in the provided object is ignored in this function
     */
    async createReward(reward: Reward): Promise<Reward> {

        // create a row in the database from the given data
        let statement = this.db.prepare(`INSERT INTO rewards(userID, name, description, completions, value, deleted) values(?,?,?,?,?,?)`);

        let info = statement.run(
            reward.userID, 
            reward.name, 
            reward.description, 
            0, // completions defaults to 0.
            reward.value,
            0, // deleted also defaults to 0.
        );



        // Returning the rowID of the newly inserted object to be returned
        let rowID = info.lastInsertRowid;

        let newReward = reward;
        newReward.rewardID = rowID as number;

        return newReward;

    }

    /**
     * Returns a task from a given ID. Returns null if there is no user with the 
     * specified ID
     */
    async getByID(id: number): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE rewardID = ? AND deleted = 0;`);
        // return A reward via the toRewardChecked function. If the reward doesn't exist
        // or is malformed a null is returned.
        return toRewardChecked(statement.get(id));
    }

    /**
     * Returns all tasks in the table in an array.
     */
    async getAll(): Promise<Reward[]> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE deleted = 0;`);
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

    /**
     * Returns a reward from a given name. Returns null if there is no reward with the 
     * specified name. Case sensitive.
     */
    async getByName(name: string): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE name = ? AND deleted = 0;`);
        // return A reward via the toRewardChecked function. If the reward doesn't exist
        // or is malformed a null is returned.
        return toRewardChecked(statement.get(name)); 
    }

    /**
     *
     * Updates the task of a given ID with new Row Data. 
     *
     * @param id The id of the task to change
     * @param newReward the information of the new reward to be inserted, except the rewardID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateReward(id: number, newReward: Reward): void {
        // update a row in the database from the given data
        let statement = this.db.prepare(`
            UPDATE rewards SET userID = ?, name = ?, description = ?, completions = ?, value = ? WHERE rewardID = ? AND deleted = 0;`
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

    /**
     * Delete the reward of a specified id. Throws an error if there is no such reward.
     */
    deleteReward(id: number): void {
        // Delete reward with ID
        let statement = this.db.prepare(`UPDATE rewards SET deleted = 1 WHERE rewardID = ? AND deleted = 0;`);
        let info = statement.run(id);

        // This should trip if the ID isn't in the database, but should be avoided
        // by the caller
        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 

    /**
     * Restore the reward from deletion of a specified id. 
     * Throws an error if there is no such reward.
     */
    restoreReward(id: number): void {
        // Delete reward with ID
        let statement = this.db.prepare(`UPDATE rewards SET deleted = 0 WHERE rewardID = ?`);
        let info = statement.run(id);

        // This should trip if the ID isn't in the database, but should be avoided
        // by the caller
        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 


    /**
     * Gets a reward if it belongs to a specific user. 
     * Returns null if the reward doesn't belong to the user, or doesn't exist.
     */
    async getRewardForUser(userID: number, rewardID: number, show_deleted: boolean = false): Promise<Reward | null> {
        let statement = this.db.prepare(`SELECT * from rewards WHERE rewardID = ? AND userID = ? ${show_deleted ? "" : "AND deleted = 0;"}`);
        return toRewardChecked(statement.get(rewardID, userID));
    }

    /**
     * Gets all the rewards for a specific user. 
     * Returns [] if a user has no rewards, an null if the user doesn't exist.
     */
    async getRewardsForUser(userID: number): Promise<Reward[]> {
        // functions in the same way as getRewards, except with the extra WHERE clause
        let statement = this.db.prepare(`SELECT * from rewards WHERE userID = ? AND deleted = 0;`);
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
