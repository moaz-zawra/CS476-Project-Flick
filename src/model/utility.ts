import express = require("express");
import session = require('express-session');
import { User } from "./userRegister";
import path = require('path');
import dotenv = require('dotenv');
import {dbConnect} from "./dbConnect";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Sets default session values for incoming requests.
 *
 * @param {express.Express} controller - The Express application instance.
 *
 * @description This function ensures that every session has default values.
 * If a session does not contain a `logged_in` flag, it is set to `false`.
 * If a session does not contain `user_info`, it is initialized with a default
 * username of "Guest" and a role of "visitor".
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

export function setUserSession(req: express.Request, user:User) {
    req.session.logged_in = true;
    req.session.user_info = {username: user.email, role: "user"};
}
export function setModSession(req: express.Request, user:User) {
    req.session.logged_in = true;
    req.session.user_info = {username: user.email, role: "moderator"};
}



export function logUserActivity(action:string, username:string) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    console.log(`[${time}] User ${username} ${action}`);
}

/**
 * Sets up and configures an Express application.
 *
 * @param {string} path_to_pub - Path to the public directory for static files.
 * @param {string} path_to_view - Path to the views directory for templates.
 * @returns {express.Express} An instance of an Express application.
 *
 * @description This function initializes an Express application,
 * adds middleware for parsing JSON and URL-encoded data,
 * and returns the configured instance.
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
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @returns {User} A `User` object containing the provided email and password.
 *
 * @description This function constructs a `User` object
 * with the given email and password properties.
 */
export function makeUser(email: string, password: string): User {
    return { email, password };
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
                            // @ts-ignore - Suppressing TypeScript warning for undefined rows
                            if (!rows[0]) {
                                return resolve(-1);
                            } else {
                                // @ts-ignore - Extracting uID from the query result
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