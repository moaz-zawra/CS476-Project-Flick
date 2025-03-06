import { isRegular } from "../utility";
import { Regular } from "../user/user.roles";
import express = require("express");
import {CardSetService} from "../cardSet/cardset.service";
import {CardSetRemoveStatus} from "../cardSet/cardset.types";

/**
 * Handles the deletion of a card set.
 * @param req - Express request object containing the session and query parameters
 * @param res - Express response object for sending responses and redirects
 * @returns Promise<void>
 * @throws Will redirect to homepage if user is not logged in
 * @throws Will redirect to homepage with unauthorized status if user is not a regular user
 * @throws Will attempt to delete the set if user is authorized
 */
export async function handleDeleteSet(req: express.Request, res: express.Response) {
    // Check if the user is logged in
    if (req.session.user) {
        // Check if the user is a regular user
        if (isRegular(req.session.user)) {
            // Convert session user to Regular instance and fetch all sets
            const user = Object.assign(new Regular("", ""), req.session.user);
            const setID = Number(req.body.setID);
            if (isNaN(setID)) {
                res.status(400).json({ error: 'Invalid set ID' });
                return;
            }

            const status = await CardSetService.deleteSet(setID);
            if (status === CardSetRemoveStatus.SET_DOES_NOT_EXIST) {
                res.send("SET DOES NOT EXIST <a href='/'> go back </a>");
            }
            else if (status === CardSetRemoveStatus.DATABASE_FAILURE) {
                res.send("DATABASE FAILURE <a href='/'> go back </a>");
            }
            else if (status === CardSetRemoveStatus.SUCCESS) {
                res.redirect('/');
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
