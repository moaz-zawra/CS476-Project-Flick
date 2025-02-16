import { dbConnect } from "./dbConnect";
import { getuIDFromEmail } from "./utility";

/**
 * Enum representing possible states when checking if a user is a moderator.
 */
export enum isMod {
    /** The user does not exist in the system. */
    InvalidUser,
    /** The user exists but is not a moderator. */
    UserIsNotMod,
    /** The user is a moderator. */
    UserIsMod,
    /** A database error occurred. */
    DatabaseFailure,
}

/**
 * Checks if the given email belongs to a moderator.
 * @async
 * @param {string} email - The email address to check.
 * @returns {Promise<isMod>} A promise that resolves to an enum value indicating the user's moderation status.
 *
 */
export async function isModerator(email: string): Promise<isMod> {
    // Load required environment variables
    const host = process.env.DB_HOST;
    const db_user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;

    // Ensure required environment variables are loaded
    if (!host || !db_user || !pass) {
        throw new Error("Failed to load required database environment variables");
    }
    let connection;
    try {
        // Establish a database connection
        connection = await dbConnect(host, db_user, pass);

        // Switch to the appropriate database
        await connection.query("USE CS476");

        // Retrieve user ID from email
        const uID = await getuIDFromEmail(email);
        if (uID === -1) {
            return isMod.InvalidUser;
        }

        // Query to check if the user is a moderator
        const [rows] = await connection.execute(
            "SELECT EXISTS (SELECT 1 FROM moderators WHERE uID = ?) AS is_moderator;",
            [uID]
        );

        // Extract the result
        const isModerator = (rows as any)[0].is_moderator;
        return isModerator ? isMod.UserIsMod : isMod.UserIsNotMod;
    } catch (error) {
        console.error(error);
        return isMod.DatabaseFailure;
    } finally {
        if (connection) await connection.end()
    }
}
