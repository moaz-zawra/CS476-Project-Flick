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
    try {
        // Check if the user is logged in
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized: Please log in' });
        }

        // Verify if the user has regular access
        if (isRegular(req.session.user)) {
            // Create a Regular user instance from session data
            const user = Object.assign(new Regular("", ""), req.session.user);
            const sets = await user.getAllSets();

            // Return the fetched sets
            return res.send(sets);
        } else {
            return res.status(403).json({ error: 'Forbidden: User does not have regular access' });
        }
    } catch (error) {
        console.error('Error in handleGetSets:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
