"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeHandler = exports.asyncHandler = void 0;
exports.setupActivityLogger = setupActivityLogger;
exports.setupExpress = setupExpress;
exports.setupServer = setupServer;
exports.getCookie = getCookie;
exports.logUserActivity = logUserActivity;
exports.logUserAction = logUserAction;
exports.isNotAuthenticated = isNotAuthenticated;
exports.isAuthenticated = isAuthenticated;
exports.isRegularUser = isRegularUser;
exports.isModeratorUser = isModeratorUser;
exports.isAdminUser = isAdminUser;
exports.isRegular = isRegular;
exports.isModerator = isModerator;
exports.isAdmin = isAdmin;
exports.parseStringToArray = parseStringToArray;
const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const method_override_1 = __importDefault(require("method-override"));
const user_activity_observer_1 = require("./observer/user.activity.observer");
const user_types_1 = require("./user/user.types");
const user_roles_1 = require("./user/user.roles");
const activity_logger_1 = require("./observer/activity.logger");
const console_logger_1 = require("./observer/console.logger");
const api_1 = require("./api");
/**
 * Wraps route handlers with error handling
 * @param fn - Express route handler function
 * @returns Route handler with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error(err);
        res.status(api_1.SERVERERROR).render('error', {
            action: req.path,
            error: err.message || 'An unexpected error occurred'
        });
    });
};
exports.asyncHandler = asyncHandler;
/**
 * Error handling middleware for non-async route handlers
 * @param fn - Route handler function
 * @returns Express middleware that catches errors
 */
const routeHandler = (fn) => {
    return (req, res, next) => {
        try {
            fn(req, res, next);
        }
        catch (error) {
            console.error('Route error:', error);
            res.status(500).render('error', { action: req.path, error });
        }
    };
};
exports.routeHandler = routeHandler;
function setupActivityLogger() {
    const activitySubject = user_activity_observer_1.UserActivitySubject.getInstance();
    activitySubject.attach(new activity_logger_1.DatabaseActivityLogger());
    activitySubject.attach(new console_logger_1.ConsoleActivityLogger());
    return activitySubject;
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
    controller.use((0, method_override_1.default)('_method'));
    controller.use(express.static(path_to_pub));
    controller.set("view engine", "ejs");
    controller.set("views", path_to_view);
    return controller;
}
function setupServer(path_to_pub, path_to_view) {
    const activityLogger = setupActivityLogger();
    const controller = setupExpress(path_to_pub, path_to_view);
    return [activityLogger, controller];
}
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
/**
 * Creates a properly typed user object from session
 * @param req - Express request object
 * @param UserClass - User class to cast to
 * @returns Properly typed user object
 */
function createUserFromSession(req, UserClass) {
    return Object.assign(new UserClass("", ""), req.session.user);
}
function logUserActivity(req, res, next) {
    const activitySubject = user_activity_observer_1.UserActivitySubject.getInstance();
    const user = createUserFromSession(req, user_roles_1.Regular);
    // Create metadata with URL information
    const metadata = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    };
    // Notify all observers of this activity
    activitySubject.notify(user, user_types_1.UserAction.PAGE_VIEW, metadata);
    // Continue to the next middleware
    next();
}
function logUserAction(req, res, action) {
    const activitySubject = user_activity_observer_1.UserActivitySubject.getInstance();
    const user = createUserFromSession(req, user_roles_1.Regular);
    // Create metadata with URL information
    const metadata = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    };
    activitySubject.notify(user, action, metadata);
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
