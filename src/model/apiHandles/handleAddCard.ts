import express = require('express');
import { isRegular } from "../utility";
import { CardService } from "../card/card.service";
import { CardAddStatus } from "../card/card.types";
import { makeCard } from "../card/card.model";

/**
 * Handles adding a new card to an existing set for a regular user.
 *
 * @param req - The Express request object containing session and card data.
 * @param res - The Express response object used to return the result of the card addition.
 * @returns A Promise that resolves once the response is sent.
 */
export async function handleAddCard(req: express.Request, res: express.Response): Promise<void> {
    try {
        // Check if the user is logged in
        if (!req.session.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Check if the user is a regular user
        if (!isRegular(req.session.user)) {
            res.status(403).json({ error: 'Forbidden: Only regular users can add cards' });
            return;
        }

        // Get required fields from request body
        const { front_text, back_text, setID } = req.body;

        // Validate required fields
        if (!front_text || !back_text || !setID) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Create a new card
        const card = makeCard(setID, front_text, back_text);

        // Attempt to add the card and handle the status
        const result = await CardService.addCardToSet(card);

        // Handle different card addition statuses
        switch (result) {
            case CardAddStatus.SUCCESS:
                res.status(200).json({ message: 'Card added successfully' });
                break;
            case CardAddStatus.SET_DOES_NOT_EXIST:
                res.status(404).json({ error: 'Set does not exist' });
                break;
            case CardAddStatus.MISSING_INFORMATION:
                res.status(400).json({ error: 'Missing required card information' });
                break;
            case CardAddStatus.DATABASE_FAILURE:
            default:
                res.status(500).json({ error: 'Failed to add card' });
                break;
        }
    } catch (error) {
        console.error('Error in handleAddCard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 