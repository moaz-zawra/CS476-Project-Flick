import { dbConnect } from "./dbConnect";
import bcrypt = require("bcrypt");
import mysql = require("mysql2/promise");
import path = require('path');
import dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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
export async function checkIfUserExists(connection: mysql.Connection, email: string): Promise<boolean> {
    try {
        const [rows] = await connection.execute(
            "SELECT 1 FROM users WHERE email = ?;",
            [email]
        );
        return (rows as any).length > 0;
    } catch (err) {
        console.error("Database query error:", err);
        throw err;
    }
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
 * @returns {Promise<registerStatus>} The status of the registration attempt.
 *
 * @description This function connects to the database, checks if the user already exists,
 * and if not, inserts a new entry with the hashed password. It returns `UserAlreadyExists`
 * if the user is already registered, `Success` if registration is successful, or
 * `DatabaseFailure` if an error occurs.
 */
export async function userRegister(user: User): Promise<registerStatus> {
    let connection;

    // Load environment variables and check if they are set
    const host = process.env.DB_HOST;
    const db_user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;

    // Ensure all environment variables are present before proceeding
    if (!host || !db_user || !pass) {
        throw new Error("Failed to load .env file");
    }

    try {
        // Attempt to connect to the database
        connection = await dbConnect(host, db_user, pass);

        // Switch to the CS476 database
        await connection.query("USE CS476");

        // Check if user already exists in the database
        const userExists = await checkIfUserExists(connection, user.email);
        if (userExists) {
            return registerStatus.UserAlreadyExists;
        }

        // Insert new user with hashed password
        await connection.execute(
            "INSERT INTO users (email, hash) VALUES (?, ?);",
            [user.email, hashPassword(user.password)]
        );

        return registerStatus.Success;
    } catch (error) {
        console.error("Error:", error);
        return registerStatus.DatabaseFailure;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
