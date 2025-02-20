import express = require("express");
import session = require('express-session');
import { User } from "../old/userRegister";
import path = require('path');
import dotenv = require('dotenv');
import { dbConnect } from "../old/dbConnect";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Sets default session values for incoming requests.
 *
 * @param {express.Express} controller - The Express application instance.
 *
 * @description This middleware ensures that each session has default values.
 * It sets the `logged_in` flag to `false` and initializes `user_info` with a default
 * username of "Guest" and a role of "visitor" if they are not already set.
 */
export function setDefaultSession(controller: express.Express) {
    controller.use((req, res, next) => {
        if (!req.session.logged_in) {
            req.session.logged_in = false; // Default login status
        }
        if (!req.session.user_info) {
            req.session.user_info = { username: "Guest", role: "visitor" }; // Default user information
        }
        next();
    });
}

/**
 * Sets a user session with a standard user role.
 *
 * @param {express.Request} req - The Express request object.
 * @param {User} user - The user object containing user information.
 *
 * @description This function sets the session's `logged_in` flag to `true`
 * and assigns the user role as "user" based on the provided `user` object.
 */
export function setUserSession(req: express.Request, user: User) {
    req.session.logged_in = true;
    req.session.user_info = { username: user.email, role: "user" };
}

export function setAdminSession(req: express.Request, user: User) {
    /**
     * Sets a user session with a administrator role.
     *
     * @param {express.Request} req - The Express request object.
     * @param {User} user - The user object containing user information.
     *
     * @description This function sets the session's `logged_in` flag to `true`
     * and assigns the user role as "user" based on the provided `user` object.
     */
    req.session.logged_in = true;
    req.session.user_info = { username: user.email, role: "administrator" };
}

/**
 * Sets a user session with a moderator role.
 *
 * @param {express.Request} req - The Express request object.
 * @param {User} user - The user object containing user information.
 *
 * @description This function sets the session's `logged_in` flag to `true`
 * and assigns the user role as "moderator" based on the provided `user` object.
 */
export function setModSession(req: express.Request, user: User) {
    req.session.logged_in = true;
    req.session.user_info = { username: user.email, role: "moderator" };
}

/**
 * Logs a user's activity with a timestamp.
 *
 * @param {string} action - The action performed by the user.
 * @param {string} username - The username of the user performing the action.
 *
 * @description This function records user activity in the console with a timestamp in HH:MM format.
 */
export function logUserActivity(action: string, username: string): string {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const msg = `[${time}] ${username} ${action}`;
    console.log(msg)
    return msg
}

/**
 * Sets up and configures an Express application.
 *
 * @param {string} path_to_pub - Path to the public directory for static files.
 * @param {string} path_to_view - Path to the views directory for templates.
 * @returns {express.Express} An instance of an Express application.
 *
 * @description This function initializes an Express application,
 * adds middleware for JSON and URL-encoded data parsing, and configures the session.
 * It returns the configured Express app instance.
 */
export function setupExpress(path_to_pub: string, path_to_view: string): express.Express {
    let controller = express();
    controller.use(express.json());
    controller.use(express.urlencoded({ extended: true }));

    const secret = process.env.SESSION_SECRET || "NULL";
    if (secret === "NULL") {
        throw new Error("Failed to load .env file in fn setupExpress()");
    }

    controller.use(session({
        secret: secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Change to true if running on HTTPS
    }));

    controller.use(express.static(path_to_pub));
    controller.set("view engine", "ejs");
    controller.set("views", path_to_view);

    return controller;
}

/**
 * Creates a new `User` object.
 *
 * @param username
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @returns {User} A `User` object containing the provided email and password.
 *
 * @description This function constructs a `User` object with the given email and password properties.
 */
export function makeUser(username: string, email: string, password: string): User {
    return { username, email, password };
}

/**
 * Retrieves the user ID (uID) associated with a given email.
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<number>} A promise resolving to the user ID, or -1 if not found or if an error occurs.
 *
 * @description This function connects to the database, checks if the email exists,
 * and returns the corresponding user ID. If the email is not found or an error occurs, it returns -1.
 */
export async function getuIDFromEmail(email: string): Promise<number> {
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

        // Query the database for the user ID
        const [rows] = await connection.execute(
            "SELECT uID FROM users WHERE email = ?",
            [email]
        );

        // Check if a matching user was found
        if (!rows || (rows as any).length === 0) {
            return -1;
        }

        // Extract and return the user ID
        return (rows as any)[0].uID;
    } catch (error) {
        console.error("Error:", error);
        return -1;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}


/**
 * Parses a comma-separated string into a JSON stringified array.
 *
 * @param {string} input - The input string containing comma-separated values.
 * @returns {string} A JSON stringified array of trimmed non-empty values.
 *
 * @description This function splits the input string by commas, trims each item,
 * removes empty items, and returns the result as a JSON stringified array.
 */
export function parseStringToArray(input: string): string {
    if (!input) {
        console.error("Input is missing");
        return input;
    }

    const parsedArray = input
        .split(",") // Split by comma
        .map(item => item.trim()) // Trim spaces
        .filter(item => item.length > 0); // Remove empty items

    return JSON.stringify(parsedArray);
}
