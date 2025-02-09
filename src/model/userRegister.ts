import { dbConnect } from "./dbConnect";
import bcrypt = require("bcrypt");
import mysql = require("mysql2");
import dotenv = require('dotenv');
import {loginStatus} from "./userLogin";
dotenv.config();

/**
 * Represents user information required for database entry.
 */
export interface User {
    /** The email address of the user. */
    email: string;
    /** The password of the user. */
    password: string;
}

/**
 * Hashes a password using bcrypt with a salt factor of 12.
 *
 * @param {string} password - The plaintext password to hash.
 * @returns {string} The hashed password.
 * @see {@link https://en.wikipedia.org/wiki/Bcrypt}
 */
export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 12);
}

/**
 * Checks if a user exists in the database.
 *
 * @param {mysql.Connection} connection - The database connection.
 * @param {string} email - The email address of the user to check.
 * @returns {Promise<boolean>} A promise resolving to `true` if the user exists, otherwise `false`.
 */
export function checkIfUserExists(connection: mysql.Connection, email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        connection.execute(
            "SELECT 1 FROM users WHERE email = ?;",
            [email],
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject(false); // Reject with false on error
                } else {
                    // @ts-ignore
                    resolve(result[0] !== undefined); // Resolve with true/false based on the result
                }
            }
        );
    });
}

/**
 * Enum representing possible registration statuses.
 * @enum {number}
 */
export enum registerStatus {
    /** User already exists in the database. */
    UserAlreadyExists,
    /** Registration was successful. */
    Success,
    /** A database error occurred. */
    DatabaseFailure,
}

/**
 * Registers a new user in the database.
 *
 * @param {User} user - The user object containing email and password.
 * @returns {registerStatus} The status of the registration attempt.
 *
 * @description This function connects to the database, checks if the user already exists,
 * and if not, inserts a new entry with the hashed password. It returns `UserAlreadyExists`
 * if the user is already registered, `Success` if registration is successful, or
 * `DatabaseFailure` if an error occurs.
 */
export function userRegister(user: User): Promise<registerStatus> {
    return new Promise((resolve) => {
        let host = process.env.DB_HOST || 'NULL';
        let db_user = process.env.DB_USER || 'NULL';
        let pass = process.env.DB_PASSWORD || 'NULL';
        if (host == 'NULL' || db_user == 'NULL' || pass == 'NULL'){
            return resolve(registerStatus.DatabaseFailure);
        }
        dbConnect(host, db_user, pass).then(async (connection) => {
            if (connection instanceof Error) {
                console.error(connection.message);
                return resolve(registerStatus.DatabaseFailure);
            }

            connection.query("USE CS476", function (err) {
                if (err) {
                    console.error(err);
                    return resolve(registerStatus.DatabaseFailure);
                }

                checkIfUserExists(connection, user.email).then((result) => {
                    if (result) {
                        return resolve(registerStatus.UserAlreadyExists);
                    }

                    connection.execute(
                        "INSERT INTO users (email, hash) VALUES (?,?);",
                        [user.email, hashPassword(user.password)],
                        (err) => {
                            if (err) {
                                console.error(err);
                                return resolve(registerStatus.DatabaseFailure);
                            } else {
                                return resolve(registerStatus.Success);
                            }
                        }
                    );
                });
            });
        });

    return resolve (registerStatus.DatabaseFailure);
});
}
