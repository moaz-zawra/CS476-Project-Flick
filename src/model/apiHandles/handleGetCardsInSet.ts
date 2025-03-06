import express = require("express");
import { isRegular } from "../utility";
import { Regular } from "../user/user.roles";
import {CardService} from "../card/card.service";

/**
 * Handles the request to fetch all cards in a specific set.
 * @param req - Express request object containing the session and query parameters
 * @param res - Express response object for sending responses and redirects
 * @returns Promise<void>
 * @throws Will redirect to homepage if user is not logged in
 * @throws Will redirect to homepage with unauthorized status if user is not a regular user
 * @throws Will send the fetched cards as JSON response if user is authorized
 */
export async function handleGetCardsInSet(req: express.Request, res: express.Response) {
    // Check if the user is logged in
    if (req.session.user) {
        // Check if the user is a regular user
        if (isRegular(req.session.user)) {
            const setID = req.query.setID as string;
            const cards = await CardService.getCards(setID);
            res.json(cards);
        } else {
            // Redirect unauthorized users
            res.redirect("/?status=unauthorized");
        }
    } else {
        // Redirect to the homepage if the user is not logged in
        res.redirect('/');
    }
}
