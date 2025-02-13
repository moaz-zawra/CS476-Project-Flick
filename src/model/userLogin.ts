import bcrypt = require('bcrypt');
import {User} from './userRegister';
import {dbConnect} from "./dbConnect";
import path = require('path');
import dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Enum representing possible login statuses.
 * @enum {number}
 */
export enum loginStatus {
    /** Incorrect password was provided. */
    WrongPassword,
    /** The user does not exist in the database. */
    DoesNotExist,
    /** Login was successful. */
    Success,
    /** A database error occurred. */
    DatabaseFailure
}

/**
 * Retrieves the user ID (uID) associated with a given email.
 *
 * @async
 * @param {string} email - The email of the user.
 * @returns {Promise<number>} A promise resolving to the user ID, or -1 if not found or if an error occurs.
 *
 * @description This function connects to the database, checks if the email exists,
 * and returns the corresponding user ID. If the email is not found, it returns -1.
 * If a database error occurs, it also returns -1.
 */
export function getuIDFromEmail(email: string): Promise<number> {
    return new Promise((resolve) => {
        // Load database credentials from environment variables
        let host = process.env.DB_HOST || 'NULL';
        let db_user = process.env.DB_USER || 'NULL';
        let pass = process.env.DB_PASSWORD || 'NULL';

        // Ensure required environment variables are loaded
        if (host === 'NULL' || db_user === 'NULL' || pass === 'NULL') {
            throw new Error("Failed to load .env file");
        }

        // Connect to the database
        dbConnect(host, db_user, pass)
            .then((connection) => {
                if (connection instanceof Error) {
                    console.error(connection.message);
                    return resolve(-1);
                }

                // Select the database
                connection.query("USE CS476", (err) => {
                    if (err) {
                        console.error(err);
                        return resolve(-1);
                    }

                    // Query the database for the user ID
                    connection.execute(
                        "SELECT uID FROM users WHERE email = ?",
                        [email],
                        (err, rows) => {
                            if (err) {
                                console.error(err);
                                return resolve(-1);
                            }

                            // Check if a matching user was found
                            // @ts-ignore
                            if (rows[0] === undefined) {
                                return resolve(-1);
                            } else {
                                // @ts-ignore
                                console.log(rows[0].uID);
                                // @ts-ignore
                                return resolve(rows[0].uID);
                            }
                        }
                    );
                });
            })
            .catch((error) => {
                console.error("Database connection error:", error);
                return resolve(-1);
            });
    });
}

/**
 * Attempts to log in a user and returns a login status.
 *
 * @async
 * @param {User} user - The user object containing email and password.
 * @returns {Promise<loginStatus>} A promise resolving to the status of the login attempt.
 *
 * @description This function connects to the database, checks if the user exists,
 * and verifies the password. If the user does not exist, it returns `DoesNotExist`.
 * If the password is incorrect, it returns `WrongPassword`. If the password is correct,
 * it returns `Success`. Any other errors result in `DatabaseFailure`.
 */
export function userLogin(user: User): Promise<loginStatus> {
    return new Promise((resolve) => {

        let host = process.env.DB_HOST || 'NULL';
        let db_user = process.env.DB_USER || 'NULL';
        let pass = process.env.DB_PASSWORD || 'NULL';
        if (host == 'NULL' || db_user == 'NULL' || pass == 'NULL'){
            throw new Error("Failed to load .env file");
        }
        dbConnect(host, db_user, pass)
            .then((connection) => {
                if (connection instanceof Error) {
                    console.error(connection.message);
                    return resolve(loginStatus.DatabaseFailure);
                }
                connection.query("USE CS476", (err) => {
                    if (err) {
                        console.error(err);
                        return resolve(loginStatus.DatabaseFailure);
                    }

                    connection.execute(
                        "SELECT uID, hash FROM users WHERE email = ?",
                        [user.email],
                        (err, rows) => {
                            if (err) {
                                console.error(err);
                                return resolve(loginStatus.DatabaseFailure);
                            }

                            // @ts-ignore
                            if(rows[0] === undefined) {
                                return resolve(loginStatus.DoesNotExist);
                            }
                            else {
                                // @ts-ignore
                                let uID = rows[0].uID.toString();
                                console.log("Processing login for uID " + uID);
                                // @ts-ignore
                                let hash = rows[0].hash.toString();
                                let correct_password = bcrypt.compareSync(user.password, hash);
                                if(correct_password) return resolve(loginStatus.Success);
                                else return resolve(loginStatus.WrongPassword);
                            }
                        }
                    );
                });
            })
            .catch((error) => {
                console.error("Database connection error:", error);
                return resolve(loginStatus.DatabaseFailure);
            });
    });
}




