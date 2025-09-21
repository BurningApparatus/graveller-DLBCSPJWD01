import { Reward } from '../models/rewardModel'


/**
 * Interface for interacting with the Reward Table in the database.
 */
export interface RewardTable {
    
    /**
     * Creates a Reward in the table with the information provided
     * errors may be thrown and must be handled by the controller function
     * The rewardID property in the provided object is ignored in this function
     */
    createReward(task: Reward): Promise<Reward>,

    /**
     * Returns a task from a given ID. Returns null if there is no user with the 
     * specified ID
     */
    getByID(id: number): Promise<Reward | null>,

    /**
     * Returns all tasks in the table in an array.
     */
    getAll(): Promise<Reward[]>,

    /**
     * Returns a task from a given name. Returns null if there is no user with the 
     * specified name. Case sensitive.
     */
    getByName(name: string): Promise<Reward | null>,

    /**
     * Updates the task of a given ID with new Row Data. 
     *
     * @param id The id of the task to change
     * @param newReward the information of the new reward to be inserted, except the rewardID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateReward(id: number, newReward: Reward): void,

    /**
     * Delete the task of a specified id. Throws an error if there is no such reward.
     */
    deleteReward(id: number): void,

    /**
     * Gets a reward if it belongs to a specific user. 
     * Returns null if the reward doesn't belong to the user, or doesn't exist.
     */
    getRewardForUser(userID: number, rewardID: number): Promise<Reward | null>;

    /**
     * Gets all the rewards for a specific user. 
     * Returns [] if a user has no rewards, an null if the user doesn't exist.
     */
    getRewardsForUser(userID: number): Promise<Reward[]>;


    
}
