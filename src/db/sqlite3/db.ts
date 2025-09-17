
import DatabaseConstructor, {Database} from "better-sqlite3";

import { SQLiteUserTable } from "./userTable"
import { SQLiteTaskTable } from "./taskTable"
import { SQLiteRewardTable } from "./rewardTable"


export const db = new DatabaseConstructor('./graveller.db', { verbose: console.log });


export const userTable = new SQLiteUserTable(db);
export const taskTable = new SQLiteTaskTable(db);
export const rewardTable = new SQLiteRewardTable(db);
