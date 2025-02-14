import {dbConnect} from "./dbConnect";
import {loginStatus} from "./userLogin";
import {checkIfUserExists, hashPassword, registerStatus} from "./userRegister";
import {getuIDFromEmail} from "./utility";

/**
 * Enum representing possible states when checking if a user is a moderator.
 */
export enum isMod {
    InvalidUser,
    UserIsNotMod,
    UserIsMod,
    DatabaseFailure,
}

/**
 * Checks if the given email belongs to a moderator.
 *
 * @param {string} email - The email address to check.
 * @returns {Promise<isMod>} A promise that resolves to an enum value indicating the user's moderation status.
 *
 * @description This function queries the database to determine whether
 * the provided email corresponds to a moderator. It ensures necessary
 * environment variables are loaded and handles database connection errors.
 */
export function isModerator(email: string): Promise<isMod> {
    return new Promise((resolve) => {
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
                    return resolve(isMod.DatabaseFailure);
                }

                // Select database
                connection.query("USE CS476", function (err) {
                    if (err) {
                        console.error(err);
                        return resolve(isMod.DatabaseFailure);
                    }

                    // Retrieve user ID from email
                    getuIDFromEmail(email).then((uID) => {
                        if (uID == -1) {
                            return resolve(isMod.InvalidUser);
                        }

                        // Check if user is a moderator
                        connection.execute(
                            "SELECT EXISTS (SELECT 1 FROM moderators WHERE uID = ?) AS is_moderator;",
                            [uID],
                            (err, rows) => {
                                if (err) {
                                    console.error(err);
                                    return resolve(isMod.DatabaseFailure);
                                } else {
                                    // @ts-ignore
                                    let isModerator = rows[0].is_moderator;
                                    return resolve(isModerator ? isMod.UserIsMod : isMod.UserIsNotMod);
                                }
                            }
                        );
                    });
                });
            });
    });
}
