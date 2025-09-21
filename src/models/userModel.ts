
/**
 * General structure for User types used internally within the backend
 * Each property represents a field in the rewards table, sharing its
 * name in the table.
 *
 * @interface User
 * @property userID - The primary key of the user
 * @property name - The user's name
 * @property passwordHash - The hashed password of the user with bcrypt
 * @property balance - The user's balance
 */
export interface User {
    userID: number,
    name: string,
    passwordHash: string,
    balance: number,
}
