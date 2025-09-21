
/**
 * General structure for Reward types used internally within the backend
 * Each property represents a field in the rewards table, sharing its
 * name in the table.
 *
 * @interface Reward
 * @property rewardID - The primary key of the reward in the database
 * @property userID - The primary key of the user who owns the Reward
 * @property name - The reward's name
 * @property description - The reward's description
 * @property completions - The times the user has completed the task
 * @property value - The price of the reward
 */
export interface Reward {
    rewardID: number,
    userID: number,
    name: string,
    description: string,
    completions: number,
    value: number,
}
