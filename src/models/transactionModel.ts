

/**
 * General structure for Transaction types used internally within the backend
 * Has direct relationship with fields in the rewards table.
 *
 * @interface Task
 * @property transactionID - The primary key of the transaction in the database
 * @property userID - The primary of the user who the transaction is affected
 * @property date - The date of the transaction. Stored here as Date. Differs from the database in the SQLite implemention, as it does not have a native Date type.
 * @property amount - The amount transferred
 */
export interface Transaction {
    transactionID: number,
    userID: number,
    amount: number,
    date: Date
}


/**
 * Extra interface for defining the structure of the return type of 
 * getUserTransactionSummary() function.
 * Shows the user's net earnings on a particular date.
 * @interface TransactionSummary
 * @property date - The date of the transaction
 * @property total - The money earned/lost that day.
 */
export interface TransactionSummary {
    date: Date,
    total: number
}
