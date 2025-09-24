
/**
 * General structure for Task types used internally within the backend
 * Has direct relationship with fields in the rewards table.
 *
 * @interface Task
 * @property taskID - The primary key of the task in the database
 * @property userID - The primary of the user who owns the Task
 * @property name - The task's name
 * @property description - The task's description
 * @property due - The due date of the task. Stored here as Date. Differs from the database in the SQLite implemention, as it does not have a native Date type.
 * @property completed - Whether the task has been completed. Differs from the database in teh SQLite implemention, as it does not have a native boolean type.
 * @property value - The reward value of the task.
 * @property deleted - Whether the task has been marked for deletion
 */
export interface Task {
    taskID: number,
    userID: number,
    name: string,
    description: string,
    due: Date,
    completed: boolean,
    value: number,
    deleted: boolean
}
