import bcrypt = require('bcrypt');
import { User } from './userRegister';
import { dbConnect } from "./dbConnect";
import path = require('path');
import dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, "../../.env") });



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
                    return resolve(loginStatus.DatabaseFailure);
                }

                // Select the database
                connection.query("USE CS476", (err) => {
                    if (err) {
                        console.error(err);
                        return resolve(loginStatus.DatabaseFailure);
                    }

                    // Query the database for the user
                    connection.execute(
                        "SELECT uID, hash FROM users WHERE email = ?",
                        [user.email],
                        (err, rows) => {
                            if (err) {
                                console.error(err);
                                return resolve(loginStatus.DatabaseFailure);
                            }

                            // Check if the user exists in the database
                            // @ts-ignore - Suppressing TypeScript warning for undefined rows
                            if (!rows[0]) {
                                return resolve(loginStatus.DoesNotExist);
                            } else {
                                // Extract user ID and password hash
                                // @ts-ignore
                                let uID = rows[0].uID.toString();
                                // @ts-ignore
                                let hash = rows[0].hash.toString();

                                // Compare the provided password with the stored hash
                                let correct_password = bcrypt.compareSync(user.password, hash);
                                return resolve(correct_password ? loginStatus.Success : loginStatus.WrongPassword);
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
