import { isRegular } from "../utility";
import { Regular } from "../user/user.roles";
import express = require("express");
import { CardSetService } from "../cardSet/cardset.service";
import { CardSetGetStatus } from "../cardSet/cardset.types";

/**
 * Handles the request to fetch a specific card set for a regular user.
 * 
 * @param req - Express request object containing the session information and setID parameter
 * @param res - Express response object for sending responses and redirects
 * @returns Promise<void>
 * @throws Will redirect to homepage if user is not logged in
 * @throws Will redirect to homepage with unauthorized status if user is not a regular user
 * @throws Will send the fetched set as JSON response if user is authorized
 * @throws Will handle any database errors that occur during set fetching
 */
export async function handleGetSet(req: express.Request, res: express.Response) {

    // Check if the user is logged in
    if (req.session.user) {
        // Check if the user is a regular user
        if (isRegular(req.session.user)) {
            // Convert session user to Regular instance
            const user = Object.assign(new Regular("", ""), req.session.user);
            
            // Get setID from request parameters
            const setID = parseInt(req.query.setID as string);
            
            if (isNaN(setID)) {
                res.status(400).send('Invalid setID parameter');
                return;
            }

            // Fetch the specific set
            const set = await CardSetService.getSet(setID, user);

            // Handle different response cases
            if (set === CardSetGetStatus.DATABASE_FAILURE) {
                res.status(500).send('');
            } else if (set === CardSetGetStatus.SET_DOES_NOT_EXIST) {
                res.status(404).send('');
            } else {
                // Send the fetched set as the response
                res.send(set);
            }
        } else {
            // Redirect unauthorized users
            res.redirect("/?status=unauthorized");
        }
    } else {
        // Redirect to the homepage if the user is not logged in
        res.redirect('/');
    }
}
