import { isRegular } from "./utility";
import { Regular } from "./user";
import express = require("express");

export async function handleDeleteSet(req: express.Request, res: express.Response) {
    // Check if the user is logged in
    if (req.session.user) {
        // Check if the user is a regular user
        if (isRegular(req.session.user)) {
            // Convert session user to Regular instance and fetch all sets
            const user = Object.assign(new Regular("", ""), req.session.user);
            const id = req.query.setID;

            const status = user.deleteSet(req.query.setID)
        } else {
            // Redirect unauthorized users
            res.redirect("/?status=unauthorized");
        }
    } else {
        // Redirect to the homepage if the user is not logged in
        res.redirect('/');
    }
}
