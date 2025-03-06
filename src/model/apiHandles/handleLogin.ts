
import { logUserActivity } from "../utility";
import express = require("express");
import {User} from "../user/user.model";
import {UserCreator} from "../user/user.auth";
import {Administrator, Moderator, Regular} from "../user/user.roles";
import {LoginStatus} from "../user/user.types";

/**
 * Type guard to check if the provided object is of type user.
 *
 * @param obj - The object to check.
 * @returns True if the object is of type user, otherwise false.
 */
export function isUser(obj: any): obj is User {
    return obj && typeof obj === "object" && "username" in obj && "email" in obj && "role" in obj;
}

/**
 * Handles the login process for users. Checks credentials and assigns the appropriate user type to the session.
 *
 * @param req - The Express request object containing login credentials.
 * @param res - The Express response object used to redirect after login attempt.
 * @returns A Promise that resolves when the login process is complete.
 */
export async function handleLogin(req: express.Request, res: express.Response): Promise<void> {
    try {
        // Attempt login with provided credentials
        const login = await new UserCreator().login(req.body.identifier, req.body.password);
        console.log(login);
        // Check if the login response is a valid user instance
        if (isUser(login)) {
            // Redirect based on user role
            if (login instanceof Administrator) {
                req.session.user = login;
                return res.redirect('/');  // Redirect for administrators
            } else if (login instanceof Moderator) {
                req.session.user = login;
                return res.redirect('/');  // Redirect for moderators
            } else if (login instanceof Regular) {
                req.session.user = login;
                return res.redirect('/');  // Redirect for regular users
            }
        } else {
            // Handle login failure cases
            switch (login) {
                case LoginStatus.USER_DOES_NOT_EXIST:
                    return res.status(404).redirect('/login?status=does-not-exist');  // user does not exist
                case LoginStatus.DATABASE_FAILURE:
                    return res.status(500).redirect('/login?status=error');  // Database failure
                case LoginStatus.WRONG_PASSWORD:
                    return res.status(401).redirect('/login?status=wrong-password');  // Incorrect password
                default:
                    return res.status(500).redirect('/login?status=error');  // Default error
            }
        }
    } catch (error) {
        console.error('Unexpected error during login:', error);
        return res.status(500).redirect('/login?status=error');  // Internal server error
    }
}
