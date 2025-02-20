// Include NodeJS libraries
import path = require('path');
import express = require('express');

// Include functions and interfaces from other files

import {
    setupExpress,
    setDefaultSession,
    logUserActivity,
    getuIDFromEmail,

} from "../model/utility";
import {handleLogin} from "../model/handleLogin";
import {handleRegistration} from "../model/handleRegistration";
// Paths to public and view directories
const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../view');

// Server port
const port = 3000;

// ExpressJS setup
const controller = setupExpress(pub, view);

// Set default session values for new users
setDefaultSession(controller);


controller.post('/api/v2/login', async (req,res) =>{
    await handleLogin(req, res);
});
controller.post('/api/v2/register', async (req,res) =>{
    await handleRegistration(req, res);
});

/**
 * Dashboard or Home page
 */
controller.get('/', async (req, res) => {
    res.render("construction")
    /*
    if (req.session.logged_in && req.session.user_info) {
        logUserActivity('logged in', req.session.user_info.username);

        if (req.session.user_info.role === "administrator"){
            const response = await fetch(`http://localhost:3000/api/v1/getAllMods`);
            return res.render("admin_dashboard", {
                uname: req.session.user_info.username,
                status: req.query.status
            });
        }

        if (req.session.user_info.role === "moderator")
            return res.render("mod_dashboard", {
                uname: req.session.user_info.username,
                status: req.query.status
            });

        if (req.session.user_info.role === "user")
            try {
                const userID = await getuIDFromEmail(req.session.user_info.username);
                const response = await fetch(`http://localhost:3000/api/v1/getSets/${userID}`);
                const sets = await response.json();

                sets.forEach((item: { tags: string; }) => {
                    item.tags = JSON.parse(item.tags); // Parse the 'tags' string into an array
                });
                console.log(sets.length)
                return res.render("user_dashboard", {
                    uname: req.session.user_info.username,
                    status: req.query.status,
                    sets: sets
                });
            } catch (error) {
                console.log(error)
                return res.render("user_dashboard", {
                    uname: req.session.user_info.username,
                    status: req.query.status,
                    sets: error
                });
            }
    }
    return res.redirect('/login');
     */
});

/**
 * Login page
 */
controller.get('/login', (req, res) => {
    if (req.session.logged_in && req.session.user_info) return res.redirect('/');
    return res.render('login', { status: req.query.status });
});

/**
 * Registration page
 */
controller.get('/register', (req, res) => {
    if (req.session.logged_in) return res.redirect('/');
    return res.render('register', { status: req.query.status });
});

/**
 * Account settings page (Not yet implemented)
 */
controller.get('/account', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

/**
 * Views for moderator actions (Not yet implemented)
 */
controller.get('/moderator/report', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/moderator/review', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/moderator/useradmin', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

controller.get('/newset', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

/**
 * Catch-all route for undefined pages (404 error)
 */
controller.get('*', (req, res) => res.status(404).sendFile(pub + "notfound.html"));

// Start the server
controller.listen(port, () => console.log("Server running on 24.72.0.105:" + port));
