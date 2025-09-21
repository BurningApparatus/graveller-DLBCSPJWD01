
import { User } from '../models/userModel'
/**
 * Interface for interacting with the User Table in the database.
 */
export interface UserTable {
    
    /**
     * Creates a User in the user table with the following name and password
     * errors (such as non-unique username) may be thrown and must be handled by 
     * the controller function
     */
    createUser(name: string, password: string): Promise<User>,

    /**
     * Returns a user from a given ID. Returns null if there is no user with the 
     * specified ID
     */
    getByID(id: number): Promise<User | null>,

    /**
     * Returns all users in the table in an array.
     */
    getAll(): Promise<User[]>,

    /**
     * Returns a user from a given name. Returns null if there is no user with the 
     * specified name. Case sensitive.
     */
    getByName(name: string): Promise<User | null>,

    /**
     * Updates the user of a given ID with new Row Data. 
     *
     * @param id The id of the user to change
     * @param newUser the information of the new user to be inserted, except the userID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateUser(id: number, newUser: User): void,

    /**
     * Delete the user of a specified id. Throws an error if there is no such user.
     */
    deleteUser(id: number): void,
}
