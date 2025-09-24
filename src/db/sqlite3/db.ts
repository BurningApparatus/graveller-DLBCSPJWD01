/**
 * @packageDocumentation
 * This file exists as the delcaration of global variables which handle the I/O operations 
 * for each table individually. Files are expected to import each relevant global variable
 * for their specified requirements.
 */

import DatabaseConstructor, {Database} from "better-sqlite3";

import { SQLiteUserTable } from "./userTable"
import { SQLiteTaskTable } from "./taskTable"
import { SQLiteRewardTable } from "./rewardTable"
import { SQLiteTransactionTable } from "./transactionTable"

// Create the one database connection which is used by all tables.
export const db = new DatabaseConstructor('./graveller.db', { verbose: console.log });


export const userTable = new SQLiteUserTable(db);
export const taskTable = new SQLiteTaskTable(db);
export const rewardTable = new SQLiteRewardTable(db);
export const transactionTable = new SQLiteTransactionTable(db);
