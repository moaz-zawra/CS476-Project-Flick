"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookie = getCookie;
exports.logUserActivity = logUserActivity;
exports.isNotAuthenticated = isNotAuthenticated;
exports.isAuthenticated = isAuthenticated;
exports.isRegularUser = isRegularUser;
exports.isModeratorUser = isModeratorUser;
exports.isAdminUser = isAdminUser;
exports.isRegular = isRegular;
exports.isModerator = isModerator;
exports.isAdmin = isAdmin;
exports.setupExpress = setupExpress;
exports.parseStringToArray = parseStringToArray;
const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
function getCookie(req) {
    try {
        let cookieString = req.headers.cookie;
        let cookies = cookieString ? cookieString.split(";") : [];
        let idx = cookies.findIndex(cookie => cookie.trim().startsWith("connect.sid="));
        if (idx == -1)
            return "";
        return cookies[idx];
    }
    catch (error) {
        console.error("Error getting session cookie ", error);
        return "";
    }
}
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
function logUserActivity(req, res, next) {
    var _a;
    const timestamp = new Date().toISOString(); // ISO 8601 format timestamp
    const username = ((_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username) || "Visitor";
    console.log(`${timestamp} - ${username} visited ${req.originalUrl}`);
    next();
}
/**
 * Middleware to check if the user is NOT authenticated.
 * If a user is already logged in, block access and return a 403 Forbidden response.
 */
function isNotAuthenticated(req, res, next) {
    if (req.session.user) {
        res.status(403).redirect('/');
        return;
    }
    next();
}
/**
 * Middleware to check if the user is authenticated.
 */
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        console.log("not authenticated");
        res.status(401).redirect('/login');
        return;
    }
    next();
}
/**
 * Middleware to check if the user is a Regular user.
 */
function isRegularUser(req, res, next) {
    if (!req.session.user || !isRegular(req.session.user)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        return;
    }
    next();
}
/**
 * Middleware to check if the user is a Moderator.
 */
function isModeratorUser(req, res, next) {
    if (!req.session.user || !isModerator(req.session.user)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        return;
    }
    next();
}
/**
 * Middleware to check if the user is an Administrator.
 */
function isAdminUser(req, res, next) {
    if (!req.session.user || !isAdmin(req.session.user)) {
        res.status(403).json({ error: 'Forbidden: You do not have permission.' });
        return;
    }
    next();
}
function isRegular(user) {
    if (!user)
        return false;
    return user.role === "REGULAR" || user.role === "MODERATOR" || user.role === "ADMINISTRATOR";
}
function isModerator(user) {
    if (!user)
        return false;
    return user.role === "MODERATOR" || user.role === "ADMINISTRATOR";
}
function isAdmin(user) {
    if (!user)
        return false;
    return user.role === "ADMINISTRATOR";
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
function setupExpress(path_to_pub, path_to_view) {
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
function parseStringToArray(input) {
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
