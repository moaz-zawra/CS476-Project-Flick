import express = require('express');
import { isRegular } from "../utility";
import { Regular } from "../user/user.roles";
import { UserService } from "../user/user.service";
import { makeCardSet, Category } from "../cardSet/cardset.model";
import { CardSetAddStatus } from "../cardSet/cardset.types";

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

        // Get required fields from request body
        const { setName, setDesc: description, category, subCategory } = req.body;

        // Validate category
        const categoryNum = parseInt(category);
        if (isNaN(categoryNum) || !Object.values(Category).includes(categoryNum)) {
            res.status(400).send("Invalid category!");
            return;
        }

        // Validate subCategory
        if (!subCategory) {
            res.status(400).send("Subcategory is required!");
            return;
        }

        // Create a new card set
        const set = makeCardSet(
            await UserService.getIDOfUser(req.session.user),
            setName,
            categoryNum as Category,
            subCategory,
            description
        );

        // Attempt to add the set and handle the status
        const status = await user.addSet(set);

        // Handle different card set creation statuses
        switch (status) {
            case CardSetAddStatus.SUCCESS: {
                res.redirect("/?status=success");
                break;
            } // Redirect on success
            case CardSetAddStatus.DATABASE_FAILURE: {
                res.status(500).send("ERROR: Database failure!");
                break;
            }  // Send error message for database failure
            case CardSetAddStatus.MISSING_INFORMATION: {
                res.status(400).send("Missing information!");
                break;
            }   // Send error message for missing information
            case CardSetAddStatus.NAME_USED: {
                res.status(409).send("Name already used!");
                break;
            }  // Send error message for duplicate set name
            default: {
                res.status(500).send("ERROR!");
                break;
            }  // Default error message for any other issues
        }
    } catch (error) {
        console.error('Error in handleNewSet:', error);
         res.status(500).send("Internal server error!");  // Handle unexpected errors
    }
}
