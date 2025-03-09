import express = require('express');
import {UserCreator} from "../user/user.auth";
import {RegisterStatus} from "../user/user.types";

r
/**
 * Handles the registration process for new users. Validates input and attempts to register the user.
 * The response depends on the registration status.
 *
 * @param req - The Express request object containing registration form data.
 * @param res - The Express response object used to return the result of the registration attempt.
 * @returns A Promise that resolves once the response is sent based on the registration outcome.
 */
export async function handleRegistration(req: express.Request, res: express.Response): Promise<void> {
    const { username, email, password, cpassword } = req.body;

    // Basic input validation
    if (!username || !email || !password || !cpassword) {
        return redirectWithStatus(res, "missing-fields");  // Bad request if fields are missing
    }

    try {
        // Attempt to register the user and get the registration status
        const registrationStatus = await new UserCreator().registerUser(username, email, password, cpassword);

        // Handle the response based on registration status
        switch (registrationStatus) {
            case RegisterStatus.SUCCESS:
                return res.redirect('/login?status=registration-success');  // Redirect on successful registration
            case RegisterStatus.EMAIL_USED:
                return redirectWithStatus(res, "email-used");  // Redirect if the email is already used
            case RegisterStatus.USERNAME_USED:
                return redirectWithStatus(res, "username-used");  // Redirect if the username is already used
            case RegisterStatus.BAD_PASSWORD:
                return redirectWithStatus(res, "bad-password");  // Redirect if the password is not valid
            case RegisterStatus.PASSWORD_MISMATCH:
                return redirectWithStatus(res, "mismatch-password");  // Redirect if passwords do not match
            case RegisterStatus.DATABASE_FAILURE:
                return redirectWithStatus(res, "error");  // Redirect if there is a database failure
            default:
                return redirectWithStatus(res, "error");  // Default error redirect for any other issues
        }
    } catch (error) {
        console.error('Error in handleRegistration:', error);
        res.status(500).send("Internal server error!");  // Handle unexpected errors
    }
}
