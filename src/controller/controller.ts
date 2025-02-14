// Include NodeJS libraries
import path = require('path');
import express = require('express');

// Include functions and interfaces from other files
import { userLogin, loginStatus } from "../model/userLogin";
import { userRegister, registerStatus } from "../model/userRegister";
import {
    setupExpress,
    makeUser,
    setDefaultSession,
    logUserActivity,
    getuIDFromEmail,
    setUserSession, setModSession
} from "../model/utility";
import {isMod, isModerator} from "../model/modCheck";

// Paths to public and view directories
const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../view');

// Server port
const port = 3000;

// ExpressJS setup
const controller = setupExpress(pub, view);

// Set default session values for new users
setDefaultSession(controller);

// API Endpoints

// Handle login attempts
controller.post('/api/v1/login', async (req, res) => {
    const user = makeUser(req.body.email, req.body.password);

    try {
        const status = await userLogin(user);
        if (status === loginStatus.WrongPassword) return res.redirect(`/login?status=wrong-password`);
        if (status === loginStatus.DoesNotExist) return res.redirect(`/login?status=does-not-exist`);
        if (status === loginStatus.Success) {
            const modStatus = await isModerator(user.email);
            if (modStatus === isMod.UserIsMod) setModSession(req, user);
            else if (modStatus === isMod.UserIsNotMod) setUserSession(req, user);
            else if (modStatus === isMod.InvalidUser || modStatus === isMod.DatabaseFailure) {
                return res.redirect('/login?status=error');
            }
            return res.redirect('/');
        }
        return res.redirect('/login?status=error');
    } catch (error) {
        return res.redirect('/login?status=error');
    }
});

// Handle user registration
controller.post('/api/v1/register', async (req, res) => {
    const user = makeUser(req.body.email, req.body.password);
    try {
        const status = await userRegister(user);
        if (status === registerStatus.Success) return res.redirect('/login?status=registration-success');
        if (status === registerStatus.UserAlreadyExists) return res.redirect('/register?status=user-already-exists');
        return res.redirect('/register?status=error');
    } catch (error) {
        return res.redirect('/register?status=error');
    }
});

// API routes for managing user sets (Not yet implemented)
controller.get('/api/v1/getSets/:userID', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.post('/api/v1/addSet', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/api/v1/getSet/:userID-:setID', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

// Handle user logout
controller.get('/api/v1/logout', (req, res) => {
    if (req.session.logged_in && req.session.user_info) {
        logUserActivity('logged out', req.session.user_info.username);
    }
    req.session.logged_in = false;
    req.session.user_info = { username: "Guest", role: "Visitor" };
    return res.redirect('/login');
});

// Dashboard or Home page - redirect to login if user is not authenticated
controller.get('/', (req, res) => {
    if (req.session.logged_in && req.session.user_info) {
        if (req.session.user_info.role === "moderator") return res.render("mod_dashboard");
        if (req.session.user_info.role === "user") return res.render("user_dashboard");
        logUserActivity('logged in', req.session.user_info.username);
    }
    return res.redirect('/login');
});

// Login page
controller.get('/login', (req, res) => {
    if (req.session.logged_in && req.session.user_info) return res.redirect('/');
    return res.render('login', { status: req.query.status });
});

// Registration page
controller.get('/register', (req, res) => {
    if (req.session.logged_in) return res.redirect('/');
    return res.render('register', { status: req.query.status });
});

// Account settings page (Not yet implemented)
controller.get('/account', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

// Views for moderator actions (Not yet implemented)
controller.get('/moderator/report', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/moderator/review', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/moderator/useradmin', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

controller.get('/newset', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));


// Catch-all route for undefined pages (404 error)
controller.get('*', (req, res) => res.status(404).sendFile(pub + "notfound.html"));

// Start the server
controller.listen(port, () => console.log("Server running on 24.72.0.105:" + port));
