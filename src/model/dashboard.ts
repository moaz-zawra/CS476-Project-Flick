import { getCookie, logUserActivity } from "./utility";
import { Role } from "../types/types";
import axios from "axios";
import { UserService } from "./user";
import express from "express";
import { port } from "../controller/controller";

/**
 * Sets up the dashboard based on the user's role and renders the appropriate view.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
export async function setupDashboard(req: express.Request, res: express.Response) {
    try {
        // Check if the user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }

        logUserActivity('visited dashboard', req.session.user.username);

        const { role, username } = req.session.user;

        // Check user role and set up the corresponding dashboard
        if ([Role.ADMINISTRATOR, Role.MODERATOR, Role.REGULAR].includes(role)) {
            if (role === Role.REGULAR) {
                // Handle the regular user's dashboard
                const cookie = getCookie(req);

                try {
                    const response = await axios.get(`http://localhost:${port}/api/v2/getCardSets`, {
                        headers: { cookie }
                    });

                    const user = { ...req.session.user }; // Clone user data
                    const sets = response.data;

                    return res.render('dashboard', {
                        user,
                        uID: await UserService.getIDOfUser(user),
                        status: req.query.status,
                        sets
                    });
                } catch (error) {
                    console.error("Error fetching card sets:", error);
                    return res.status(500).send("Error fetching card sets");
                }
            } else {
                // Handle admin or moderator dashboard setup
            }
        } else {
            return res.status(403).send("Forbidden: Invalid role.");
        }
    } catch (error) {
        console.error("Unexpected error during dashboard setup:", error);
        return res.status(500).send("Unexpected error occurred.");
    }
}
