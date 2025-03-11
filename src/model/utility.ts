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


export function logUserActivity(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const timestamp = new Date().toISOString(); // ISO 8601 format timestamp
    const username = req.session.user?.username || "Visitor";
    console.log(`${timestamp} - ${username} visited ${req.originalUrl}`);
    next();
}

/**
 * Middleware to check if the user is NOT authenticated.
 * If a user is already logged in, block access and return a 403 Forbidden response.
 */
export function isNotAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.session.user) {
        res.status(403).redirect('/');
        return;
    }
    next();
}
/**
 * Middleware to check if the user is authenticated.
 */
export function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session.user) {
        console.log("not authenticated")
        res.status(401).redirect('/login');
        return;

    }
    next();
}

/**
 * Middleware to check if the user is a Regular user.
 */
export function isRegularUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session.user || !isRegular(req.session.user as User)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        return;
    }
    next();
}

/**
 * Middleware to check if the user is a Moderator.
 */
export function isModeratorUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session.user || !isModerator(req.session.user as User)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        return;
    }
    next();
}

/**
 * Middleware to check if the user is an Administrator.
 */
export function isAdminUser(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.session.user || !isAdmin(req.session.user as User)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        return;
    }
    next();
}

export function isRegular(user: User): boolean {
    if(!user) return false;
    return user.role === "REGULAR" || user.role === "MODERATOR" || user.role === "ADMINISTRATOR"
}
export function isModerator(user: User): boolean {
    if(!user) return false;
    return user.role === "MODERATOR" || user.role === "ADMINISTRATOR"
}
export function isAdmin(user: User): boolean {
    if(!user) return false;
    return user.role === "ADMINISTRATOR"
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