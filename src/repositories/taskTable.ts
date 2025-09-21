
import { Task } from '../models/taskModel'


/**
 * Interface for interacting with the Task Table in the database.
 */
export interface TaskTable {
    
    /**
     * Creates a Task in the task table with the information provided
     * errors may be thrown and must be handled by the controller function
     * The taskID property in the provided object is ignored in this function
     */
    createTask(task: Task): Promise<Task>,

    /**
     * Returns a task from a given ID. Returns null if there is no user with the 
     * specified ID
     */
    getByID(id: number): Promise<Task | null>,

    /**
     * Returns all tasks in the table in an array.
     */
    getAll(): Promise<Task[]>,

    /**
     * Returns a task from a given name. Returns null if there is no user with the 
     * specified name. Case sensitive.
     */
    getByName(name: string): Promise<Task | null>,

    /**
     * Updates the task of a given ID with new Row Data. 
     *
     * @param id The id of the task to change
     * @param newTask the information of the new task to be inserted, except the userID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateTask(id: number, newTask: Task): void,

    /**
     * Delete the task of a specified id. Throws an error if there is no such user.
     */
    deleteTask(id: number): void,

    /**
     * Gets a task if it belongs to a specific user. 
     * Returns null if the task doesn't belong to the user, or doesn't exist.
     */
    getTaskForUser(userID: number, taskID: number): Promise<Task | null>;

    /**
     * Gets all the tasks for a specific user. 
     * Returns [] if a user has no tasks, an null if the user doesn't exist.
     */
    getTasksForUser(userID: number): Promise<Task[]>;


    
}
