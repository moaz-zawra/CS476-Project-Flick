import express = require('express');
import { isRegular } from "./utility";
import { Regular } from "./user";
import { CardGetStatus } from "../types/types";

/**
 * Handles the retrieval of cards from a specified set.
 * @param req - The Express request object, expecting a `set` parameter in the query.
 * @param res - The Express response object used to send responses to the client.
 */
export async function handleGetCardsInSet(req: express.Request, res: express.Response) {
    try {
        // Ensure the set parameter is properly parsed
        let set;
        try {
            set = JSON.parse(req.query.set as string);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid set data' });
        }

        if (!set) {
            return res.status(400).json({ error: 'Set parameter is required' });
        }

        // Check if the user is logged in
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify if the user has regular access
        if (isRegular(req.session.user)) {
            // Create a Regular user instance from session data
            const user = Object.assign(new Regular("", ""), req.session.user);
            const cards = await user.getCards(set.setID);

            // Handle different card retrieval statuses
            switch (cards) {
                case CardGetStatus.DATABASE_FAILURE:
                case CardGetStatus.SET_DOES_NOT_EXIST:
                    return res.redirect('/');
                case CardGetStatus.SET_HAS_NO_CARDS:
                    return res.send(""); // No cards in the set
                default:
                    return res.send(cards);
            }
        } else {
            return res.status(403).json({ error: 'Forbidden: User does not have regular access' });
        }
    } catch (error) {
        console.error('Error in handleGetCardsInSet:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
