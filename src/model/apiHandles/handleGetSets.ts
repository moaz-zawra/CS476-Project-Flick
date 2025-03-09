import { isRegular } from "../utility";
import { Regular } from "../user/user.roles";
import express = require("express");
import { CardSetService } from "../cardSet/cardset.service";
import {CardSetGetStatus} from "../cardSet/cardset.types";

/**
 * Handles the request to fetch all card sets for a regular user.
 * 
 * @param req - Express request object containing the session information
 * @param res - Express response object for sending responses and redirects
 * @returns Promise<void>
 * @throws Will redirect to homepage if user is not logged in
 * @throws Will redirect to homepage with unauthorized status if user is not a regular user
 * @throws Will send the fetched sets as JSON response if user is authorized
 * @throws Will handle any database errors that occur during set fetching
 */
export async function handleGetSets(req: express.Request, res: express.Response) {
    // Check if the user is logged in
    if (req.session.user) {
        // Check if the user is a regular user
        if (isRegular(req.session.user)) {
            // Convert session user to Regular instance and fetch all sets
            const user = Object.assign(new Regular("", ""), req.session.user);
            const sets = await CardSetService.getAllSets(user);
            // Check if sets is a CardSet
            if (sets === CardSetGetStatus.DATABASE_FAILURE){
                res.send('');
            } else if (sets === CardSetGetStatus.USER_HAS_NO_SETS){
                res.send('');
            }
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
