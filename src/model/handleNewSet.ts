import express = require('express');
import { Regular, UserService } from "./user";
import { makeCardSet, CardSetAddStatus } from "../types/types";
import { isRegular } from "./utility";

/**
 * Formats the tag string by splitting, trimming, filtering, and joining tags.
 *
 * @param tagString - The string containing tags separated by commas.
 * @returns A formatted string of tags with proper spacing.
 */
function formatTags(tagString: string): string {
    return tagString
        .split(",")                    // Split by comma
        .map(tag => tag.trim())        // Trim spaces around each tag
        .filter(tag => tag.length > 0) // Remove empty tags
        .join(", ");                   // Rejoin with ", "
}

/**
 * Handles the creation of a new card set for a regular user.
 *
 * @param req - The Express request object containing session and form data.
 * @param res - The Express response object used to return the result of the card set creation.
 * @returns A Promise that resolves once the response is sent.
 */
export async function handleNewSet(req: express.Request, res: express.Response): Promise<void> {
    try {
        // Check if the user is logged in
        if (!req.session.user) {
            return res.status(401).redirect('/');  // Unauthorized if user not logged in
        }

        // Check if the user is a regular user
        if (!isRegular(req.session.user)) {
            return res.status(403).redirect("/?status=unauthorized");  // Forbidden if not a regular user
        }

        // Convert the session user to a Regular instance
        const user = Object.assign(new Regular("", ""), req.session.user);

        // Create a new card set with formatted tags
        const set = makeCardSet(await UserService.getIDOfUser(req.session.user), req.body.setName, formatTags(req.body.tags));

        // Attempt to add the set and handle the status
        const status = await user.addSet(set);

        // Handle different card set creation statuses
        switch (status) {
            case CardSetAddStatus.SUCCESS:
                 res.redirect("/?status=success");  // Redirect on success
            case CardSetAddStatus.DATABASE_FAILURE:
                 res.status(500).send("ERROR: Database failure!");  // Send error message for database failure
            case CardSetAddStatus.MISSING_INFORMATION:
                 res.status(400).send("Missing information!");  // Send error message for missing information
            case CardSetAddStatus.NAME_USED:
                 res.status(409).send("Name already used!");  // Send error message for duplicate set name
            default:
                 res.status(500).send("ERROR!");  // Default error message for any other issues
        }
    } catch (error) {
        console.error('Error in handleNewSet:', error);
         res.status(500).send("Internal server error!");  // Handle unexpected errors
    }
}
