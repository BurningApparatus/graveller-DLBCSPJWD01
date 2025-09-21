import { Transaction, TransactionSummary } from '../models/transactionModel'


/**
 * Interface for interacting with the Transaction Table in the database.
 */
export interface TransactionTable {
    
    /**
     * Creates a Transaction in the transaction table 
     * errors (such as non-unique username) may be thrown and must be handled by 
     * the controller function
     */
    createTransaction(transaction: Transaction): Promise<Transaction>,

    /**
     * Returns a transaction from a given ID. 
     * @returns the transaction or null if there is no transaction with the specified ID
     */
    getByID(id: number): Promise<Transaction | null>,

    /**
     * Returns all transactions in the table in an array.
     */
    getAll(): Promise<Transaction[]>,

    /**
     * Returns all transactions for a specific user in the table in an array.
     */
    getAllForUser(userID: number): Promise<Transaction[]>,

    /**
     * Returns all transactions for a specific user until the specified date in the table 
     * in an array.
     */
    getUserTransactionSummary(userID: number, date: Date): Promise<TransactionSummary[]>,

    /**
     * Updates the transaction of a given ID with new Row Data. 
     *
     * @param id The id of the transaction to change
     * @param newTransaction the information of the new transaction to be inserted, except the 
     * transactionID
     * field. This is ignored, as the primary key is never changed by this function.
     */
    updateTransaction(id: number, newTransaction: Transaction): void,


}
