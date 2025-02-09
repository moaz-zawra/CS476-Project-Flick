import express = require("express");
import session = require('express-session');
import { User } from "./userRegister";
import path = require('path');
import dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Sets up and configures an Express application.
 *
 * @returns {express.Express} An instance of an Express application.
 *
 * @description This function initializes an Express application,
 * adds middleware for parsing JSON and URL-encoded data,
 * and returns the configured instance.
 */
export function setupExpress(): express.Express {
    let controller = express();
    controller.use(express.json());
    controller.use(express.urlencoded({ extended: true }));

    const secret = process.env.SESSION_SECRET || "NULL";
    if (secret == null) {
        throw new Error("Failed to load .env file");
    }
    controller.use(session({
        secret: secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure : false }, //Change to true if running on HTTPS
    }))
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

export const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // @ts-ignore
    if (req.session.logged_in) {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
};