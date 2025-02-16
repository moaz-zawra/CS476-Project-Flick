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
export async function userLogin(user: User): Promise<loginStatus> {
    let connection;

    // Load database credentials from environment variables
    const host = process.env.DB_HOST;
    const db_user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;

    // Ensure required environment variables are loaded
    if (!host || !db_user || !pass) {
        throw new Error("Failed to load .env file");
    }

    try {
        // Connect to the database
        connection = await dbConnect(host, db_user, pass);

        // Select the database
        await connection.query("USE CS476");

        // Query the database for the user
        const [rows] = await connection.execute(
            "SELECT uID, hash FROM users WHERE email = ?",
            [user.email]
        );

        // Check if the user exists in the database
        if (!(rows as any)[0]) {
            return loginStatus.DoesNotExist;
        }

        // Extract user ID and password hash
        const uID = (rows as any)[0].uID.toString();
        const hash = (rows as any)[0].hash.toString();

        // Compare the provided password with the stored hash
        const correct_password = bcrypt.compareSync(user.password, hash);
        return correct_password ? loginStatus.Success : loginStatus.WrongPassword;
    } catch (error) {
        console.error("Error:", error);
        return loginStatus.DatabaseFailure;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
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
