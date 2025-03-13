import express = require("express");
import session = require('express-session');
import path = require('path');
import dotenv = require('dotenv');
import methodOverride from 'method-override';
import { User } from "./user/user.model";
import { UserActivitySubject } from "./observer/user.activity.observer";
import { UserAction } from "./user/user.types";
import {Regular} from "./user/user.roles";
import { DatabaseActivityLogger } from "./observer/activity.logger";
import { ConsoleActivityLogger } from "./observer/console.logger";
import { SERVERERROR } from "./api";
import { CardSetService } from "./cardSet/cardset.service";
import { UserService } from "./user/user.service";
import { CardSetGetStatus } from "./cardSet/cardset.types";


/**
 * Wraps route handlers with error handling
 * @param fn - Express route handler function
 * @returns Route handler with error handling
 */
export const asyncHandler = (fn: (req: express.Request, res: express.Response, next?: express.NextFunction) => Promise<any>) => 
    (req: express.Request, res: express.Response, next: express.NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error(err);
        res.status(SERVERERROR).render('error', { 
          action: req.path, 
          error: err.message || 'An unexpected error occurred' 
        });
      });
};

/**
 * Error handling middleware for non-async route handlers
 * @param fn - Route handler function
 * @returns Express middleware that catches errors
 */
export const routeHandler = (fn: (req: express.Request, res: express.Response, next?: express.NextFunction) => void) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      fn(req, res, next);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).render('error', { action: req.path, error });
    }
  };
};

export function setupActivityLogger() : UserActivitySubject{
    const activitySubject = UserActivitySubject.getInstance();
    activitySubject.attach(new DatabaseActivityLogger());
    activitySubject.attach(new ConsoleActivityLogger());
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

    controller.use(methodOverride('_method'))
    controller.use(express.static(path_to_pub));
    controller.set("view engine", "ejs");
    controller.set("views", path_to_view);

    return controller;
}
export function setupServer(path_to_pub: string, path_to_view: string): [UserActivitySubject, express.Express] {
    const activityLogger = setupActivityLogger();
    const controller = setupExpress(path_to_pub, path_to_view);
    return [activityLogger, controller];
}

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

/**
 * Creates a properly typed user object from session
 * @param req - Express request object
 * @param UserClass - User class to cast to
 * @returns Properly typed user object
 */
export function createUserFromSession<T extends Regular>(req: express.Request, UserClass: new (username: string, email: string) => T): T {
    return Object.assign(new UserClass("", ""), req.session.user);
}

export function logUserActivity(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const activitySubject = UserActivitySubject.getInstance();
  const user = createUserFromSession(req,Regular);
  
  // Create metadata with URL information
  const metadata = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };
  // Notify all observers of this activity
  activitySubject.notify(user, UserAction.PAGE_VIEW, metadata);
  
  // Continue to the next middleware
  next();
}

export function logUserAction(req: express.Request, res: express.Response, action: UserAction): void {
    const activitySubject = UserActivitySubject.getInstance();
    const user = createUserFromSession(req,Regular);

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

/**
 * Middleware to check if the user is the owner of the specified set.
 * Expects setID in req.query or req.body.
 */
export async function isSetOwner(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
        // Get setID from request query or body
        const setID = req.query.setID || req.body.setID;
        
        if (!setID) {
            res.status(400).json({ error: 'Set ID is required' });
            return;
        }
        
        // Get the set details
        const set = await CardSetService.getSet(Number(setID));
        
        if (set === CardSetGetStatus.SET_DOES_NOT_EXIST) {
            res.status(404).json({ error: 'Set not found' });
            return;
        }
        if (set === CardSetGetStatus.USER_HAS_NO_SETS) {
            res.status(403).redirect('/?status=no-permission');
            return;
        }
        if (set === CardSetGetStatus.DATABASE_FAILURE) {
            res.status(500).json({ error: 'Database error when fetching set' });
            return;
        }
        
        // Get current user's ID
        const user = req.session.user;
        if (!user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        
        const userID = await UserService.getIDOfUser(user.username);
        
        // Check if user is the owner
        if (typeof set === 'object' && set.ownerID !== userID) {
            res.status(403).redirect('/?status=no-permission');
            return;
        }
        
        // User is the owner, proceed
        next();
    } catch (error) {
        console.error('Error verifying set ownership:', error);
        res.status(500).json({ error: 'Server error validating set ownership' });
        return;
    }
}
