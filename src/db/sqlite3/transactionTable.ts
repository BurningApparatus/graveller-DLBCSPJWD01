
import { Transaction, TransactionSummary } from '../../models/transactionModel'
import { Database } from 'better-sqlite3'

/**
 * Safely Converts an row with any type into a type that typescript understands.
 * 
 * @returns A Transaction Object if the row is well formed, and null otherwise.
 */
function toTransactionChecked(row: any): Transaction | null {

    // Check if the row is not undefined/null
    if (!row) {
        return null;
    }
    // We check if all row attributes exist and are of the right type
    if (typeof row.transactionID == 'number' && 
        typeof row.userID == 'number' && 
        typeof row.amount == 'string' &&
        typeof row.date == 'number'
    ) {
        return {
            transactionID: row.transactionID,
            userID: row.userID,
            amount: row.amount,
            date: new Date(row.date),
        }
        
    }
    else {
        return null;
    }
}

/**
 * Class which represents an interface for the Reward table for SQLite.
 * implements the TaskTable interface defined in /repositories/taskTable.ts
 */
export class SQLiteTransactionTable {
    private db: Database;
    
    constructor(db: Database) {
        this.db = db;
    }

    /**
     * Create the table if it doesn't already exist
     */
    migrate(): void {

        // NOTE: SQLite doesn't have types for datetime (https://sqlite.org/datatype3.html)
        // date is a datetime type, represented in UNIX time by an integer
        let statement = this.db.prepare(`
            CREATE TABLE IF NOT EXISTS transactions(
                transactionID INTEGER PRIMARY KEY AUTOINCREMENT,
                userID INTEGER NOT NULL,
                amount INTEGER NOT NULL,
                date INTEGER NOT NULL,
                FOREIGN KEY (userID)
                REFERENCES users (userID)
            );`
        );
        statement.run();
    }    

    /**
     * Creates a Transaction in the transaction table 
     * errors (such as non-unique username) may be thrown and must be handled by 
     * the controller function
     */
    async createTransaction(transaction: Transaction): Promise<Transaction> {



        let statement = this.db.prepare(`INSERT INTO transactions(userID, amount, date) values(?,?,?)`);

        // For convinience, we restrict the date to only include days, no 
        // time
        let stripped_date = new Date(
           transaction.date.getFullYear(),
           transaction.date.getMonth(), 
           transaction.date.getDate(), 
        )
        // insert relevant properites into a record in the table
        let info = statement.run(
            transaction.userID, 
            transaction.amount, 
            stripped_date.getTime(),
        );



        let rowID = info.lastInsertRowid;

        let newTransaction = transaction;
        newTransaction.transactionID = rowID as number;

        return newTransaction;

    }

    /**
     * Returns a transaction from a given ID. 
     * @returns the transaction or null if there is no transaction with the specified ID
     */
    async getByID(id: number): Promise<Transaction | null> {
        let statement = this.db.prepare(`SELECT * from transactions WHERE transactionID = ?`);

        // return a task via the toTransactionChecked function. If the task doesn't exist
        // or is malformed a null is returned.
        return toTransactionChecked(statement.get(id));


    }

    /**
     * Returns all transactions in the table in an array.
     */
    async getAll(): Promise<Transaction[]> {
        let statement = this.db.prepare(`SELECT * from transactions`);
        // the all() method returns an array of records which satisfy the query
        let res = statement.all();
        
        // If no such records are found, return []
        if (!res) {
            return [];
        }

        // Then, we just map each row to a Transaction object
        return res.map((potential_user: any) => {
            if (toTransactionChecked(potential_user)) {
                return potential_user
            } 
        })

    }

    /**
     * Returns all transactions for a specific user in the table in an array.
     */
    async getAllForUser(id: number): Promise<Transaction[]> {
        let statement = this.db.prepare(`SELECT * from transactions WHERE userID = ?`);
        // the all() method returns an array of records which satisfy the query
        let res = statement.all(id);
        
        // If no such records are found, return []
        if (!res) {
            return [];
        }

        // Then, we just map each row to a Transaction object
        return res.map((potential_user: any) => {
            if (toTransactionChecked(potential_user)) {
                return potential_user
            } 
        })
    }

    /**
     * Returns all transactions for a specific user until the specified date in the table 
     * in an array.
     */
    async getUserTransactionSummary(id: number, date: Date): Promise<TransactionSummary[]> {
        // Sums and groups transactions by date
        let statement = this.db.prepare(`SELECT date, SUM(amount) AS total FROM transactions WHERE userID = ? AND date >= ? GROUP BY date ORDER BY date`);
        // the all() method returns an array of records which satisfy the query
        let res = statement.all(id, date.getTime());
        
        // If no such records are found, return []
        if (!res) {
            return [];
        }

        // Then, we just map each row to a Transaction object
        return res.map((row: any) => {
            return {
                date: new Date(row.date),
                total: Number(row.total),
            }
        })
    }


    /**
     * Updates the transaction of a given ID with new Row Data. 
     *
     * @param id The id of the transaction to change
     * @param newTransaction the information of the new transaction to be inserted, except the 
     * transactionID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateTransaction(id: number, newTransaction: Transaction): void {

        // update a row in the database from the given data
        let statement = this.db.prepare(`
            UPDATE transactions SET userID = ?, amount = ?, date = ? WHERE transactionID = ?`
        );
        let info = statement.run(
            newTransaction.userID, 
            newTransaction.amount, 
            newTransaction.date.getTime(), 
            id
        );

        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }


    }

    /**
     * Deletes the transaction of a given ID 
     */
    deleteTransaction(id: number): void {
        // Delete transaction with ID
        let statement = this.db.prepare(`DELETE FROM transactions WHERE transactionID = ?`);
        let info = statement.run(id);

        // This should trip if the ID isn't in the database, but should be avoided
        // by the caller
        if (info.changes == 0) {
            throw Error("NoRowsUpdated");
        }

    } 

}
