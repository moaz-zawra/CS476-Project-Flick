import express = require("express");
import session = require('express-session');
import path = require('path');
import dotenv = require('dotenv');
import { User } from "./user/user.model";

export function getCookie(req: express.Request): string {
    try{
        let cookieString = req.headers.cookie;
        let cookies = cookieString ? cookieString.split(";"): [];
        let idx = cookies.findIndex(cookie => cookie.trim().startsWith("connect.sid="))
        if (idx == -1) return "";
        return cookies[idx];
    }catch(error){
        console.error("Error getting session cookie ", error)
        return "";
    }
}
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export function isRegular(user: User): boolean {
    return user.role === "REGULAR"
}
export function isModerator(user: User): boolean {
    return user.role === "MODERATOR"
}
export function isAdmin(user: User): boolean {
    return user.role === "ADMINISTRATOR"
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