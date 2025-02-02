import express = require("express");
import { User } from "./userRegister";

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
