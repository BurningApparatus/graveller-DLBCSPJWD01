/**
 * @packageDocumentation
 * This class inherits and implements the `Store` abstract class from express-session in
 * order to store session (cookie) information in a sqlite3 table using better-sqlite3.
 *
 * Based heavily off of https://github.com/attestate/better-sqlite3-session-store and
 * https://github.com/tj/connect-redis/
 */

// Normally, implementing your own session connector is not necessary, as many
// solutions already exist for each popular database driver. Many exist for 
// better-sqlite3 such as:
//
// https://github.com/attestate/better-sqlite3-session-store 
// https://github.com/ironboy/better-sqlite3-express-session-store
//
// However, these libraries lack type definitions and cannot be included in a
// typescript project. This implementation is rudimentary, but functions for Graveller.


import {type SessionData, Store} from "express-session"
import {log, error} from '../../utils/logging'

import { Database } from "better-sqlite3"

const oneDay = 86400000;

function getSess(res: any): SessionData | null {
    return JSON.parse(res.sess);
}
function getCount(res: any): number | null {
    if (res && res.count) {
        return res.count;
    }
    return null;
}

/**
 * Describes the options for creating the connection
 * @param { Database } client The better-sqlite3 database connection
 * @param { number } ttl The interval when the database checks for expired sessions
 * @param { string } table the name of the table in the database storing the sessions
 */
interface BetterSQLiteOptions {
    client: Database, 
    ttl?: number,
    table?: string,
}

/**
 * Class inheriting the Store class from express-session.
 *
 * Type declarations for methods, and documentation for each method may be found at:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/express-session/index.d.ts
 */
export class BetterSQliteSessionStore extends Store {
    client: Database;
    ttl: number;
    table: string;

    constructor(opts: BetterSQLiteOptions) {
        super()
        this.client = opts.client;
        this.ttl = opts.ttl || oneDay;
        this.table = opts.table || "sessions"

        this.createTable();

        // Set an interval for checking for expired cookies
        setInterval(this.clearExpired.bind(this), this.ttl);

    }

    createTable() {
        // We define "expire" as TEXT, although other dates in Graveller are represented
        // by Integers. This is because converting between express unix time (milliseconds)
        // and sqlite unix time (seconds) is a hassle, while storing ISO timestamps isn't.
        this.client.exec(`
            CREATE TABLE IF NOT EXISTS ${this.table}(
                sid TEXT NOT NULL PRIMARY KEY,
                sess JSON NOT NULL,
                expire TEXT NOT NULL
            );`
        );
    }

    clearExpired() {
        this.client.prepare(`DELETE FROM ${this.table} WHERE datetime('now') > datetime(expire)`)
            .run();
    }


    get(sid: string, callback: (err: any, session?: SessionData | null) => void): void {

        try {
            let res = this.client.prepare(`SELECT sess FROM ${this.table} WHERE sid = ? AND datetime('now') < datetime(expire)`).get(sid);
                log("GET FUNCTION RES: ", res);

            if (!res) {
                callback(null, null);
            }
            else {
                callback(null, getSess(res));
            }
            
        }
        catch (err) {
            error(err)
            callback(err);
        }
    }

    set(sid: string, session: SessionData, callback?: (err?: any) => void): void {

        log(session);

        let age = session.cookie.maxAge || oneDay;
        let now = new Date().getTime();
        let expire = new Date(now + age).toISOString();

        try {

            this.client.prepare(`INSERT OR REPLACE INTO ${this.table} VALUES (?,?,?)`)
                .run(sid, JSON.stringify(session), expire);
            if (callback) {
                callback(null);
            }
            else {
                return;
            }
        }
        catch (err) {
            error(err)
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        }
    }

    destroy(sid: string, callback?: (err?: any) => void): void {

        try {
            this.client.prepare(`DELETE FROM ${this.table} WHERE sid = ?`)
            .run(sid);
            
            if (callback) {
                callback(null);
            }
            else {
                return;
            }
        }
        catch (err) {
            error(err)
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        }
    }

    length(callback: (err: any, length?: number) => void): void {
        try {
            let res = this.client.prepare(`SELECT COUNT(*) as count FROM ${this.table}`).get();
            let count = getCount(res);
            
            if (callback) {
                if (count) {
                    callback(null, count);
                }
                else {
                    callback(null, undefined);
                }
            }
            else {
                return;
            }
        }
        catch (err) {
            error(err)
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        }
    }

    clear(callback?: (err?: any) => void): void {

        try {
            this.client.prepare(`DELETE FROM ${this.table}`).run();
            
            if (callback) {
                callback(null);
            }
            else {
                return;
            }
        }
        catch (err) {
            error(err)
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        }
    }
    
    touch(sid: string, session: SessionData, callback?: () => void): void {

        let age = session.cookie.maxAge || oneDay;
        let now = new Date().getTime();
        let expire = new Date(now + age).toISOString();

        if (session.cookie.expires) {
            expire = new Date(session.cookie.expires).toISOString();
        }

        try {
            this.client.prepare(`UPDATE ${this.table} SET expire = ? WHERE sid = ? AND datetime('now') < datetime(expire)`)
                .run(expire, sid);
            if (callback) {
                callback();
            }
            else {
                return;
            }
        }
        catch (err) {
            error(err)
            if (callback) {
                callback();
            }
            else {
                throw err;
            }
        }
    }
    all(callback: (err: any, obj?: SessionData[] | { [sid: string]: SessionData; } | null) => void): void {
        
        try {
            let res = this.client.prepare(`SELECT * FROM ${this.table}`).all();
                log("GET FUNCTION RES: ", res);
            if (!res) {
                callback(null, null);
            }
            else {
                let obj = res.map((row: any) => {
                    if (getSess(row)) {
                        return row;
                    }
                })
                callback(null, obj);
            }
            
        }
        catch (err) {
            error(err)
            callback(err);
        }
    }




}

