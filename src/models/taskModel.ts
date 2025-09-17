
export interface Task {
    taskID: number,
    userID: number,
    name: string,
    description: string,
    due: Date,
    completed: boolean,
    value: number,
}
