import { isRegular } from "./utility";
import { Regular } from "./user";
import express = require("express");

/**
 * Handles the request to fetch sets for regular users.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export async function handleGetSets(req: express.Request, res: express.Response) {
    // Check if the user is logged in
    if (req.session.user) {
        // Check if the user is a regular user
        if (isRegular(req.session.user)) {
            // Convert session user to Regular instance and fetch all sets
            const user = Object.assign(new Regular("", ""), req.session.user);
            const sets = await user.getAllSets();

            // Send the fetched sets as the response
            res.send(sets);
        } else {
            // Redirect unauthorized users
            res.redirect("/?status=unauthorized");
        }
    } else {
        // Redirect to the homepage if the user is not logged in
        res.redirect('/');
    }
}
