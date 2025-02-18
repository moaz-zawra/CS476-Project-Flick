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
    setUserSession,
    setModSession,
    getuIDFromEmail,
    parseStringToArray, setAdminSession
} from "../model/utility";
import {UserCreator, User, Regular,Moderator,Administrator, LoginStatus} from "../model/user";
import { isMod, isModerator } from "../model/modCheck";
import { addCardSet, makeCardSet } from "../model/createSet";
import { getSetsFromuID } from "../model/getSets";
import {isAdmin, isAdministrator} from "../model/adminCheck";
import {getAllModerators} from "../model/getMods";

// Paths to public and view directories
const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../view');

// Server port
const port = 3000;

// ExpressJS setup
const controller = setupExpress(pub, view);

// Set default session values for new users
setDefaultSession(controller);

/**
 * Handle login attempts
 */
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
            const adminStatus = await isAdministrator(user.email);
            if (adminStatus === isAdmin.UserIsAdmin) setAdminSession(req, user);
            else if (adminStatus === isAdmin.UserIsNotAdmin && modStatus === isMod.UserIsNotMod) setUserSession(req, user);
            else if (adminStatus === isAdmin.InvalidUser || adminStatus === isAdmin.DatabaseFailure) {
                return res.redirect('/login?status=error');
            }
            return res.redirect('/');
        }
        return res.redirect('/login?status=error');
    } catch (error) {
        return res.redirect('/login?status=error');
    }
});

/**
 * Handle user registration
 */
controller.post('/api/v1/register', async (req, res) => {
    const user = makeUser(req.body.email, req.body.password);
    const cpass = req.body.cpassword
    try {
        const status = await userRegister(user, cpass);
        if (status === registerStatus.Success) return res.redirect('/login?status=registration-success');
        else if (status === registerStatus.UserAlreadyExists) return res.redirect('/register?status=user-already-exists');
        else if (status === registerStatus.PasswordMismatch) return res.redirect('/register?status=mismatch')
        else if (status === registerStatus.BadPassword) return res.redirect('/register?status=bad-pass')
        else return res.redirect('/register?status=error');
    } catch (error) {
        return res.redirect('/register?status=error');
    }
});

/**
 * API routes for managing user sets (Not yet implemented)
 */

controller.get('/api/v1/getSet/:userID-:setID', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

controller.post('/api/v1/addSet', async (req, res) => {
    if (req.session.logged_in && req.session.user_info) {
        const userID = await getuIDFromEmail(req.session.user_info.username);
        let cs = makeCardSet(userID, req.body.set_name, parseStringToArray(req.body.set_tags));
        try {
            const status = await addCardSet(cs);
            if (status) {
                return res.redirect('/?status=success');
            } else {
                return res.redirect('/?status=failure');
            }
        } catch (error) {
            return res.redirect('/?status=failure');
        }
    } else res.redirect('/login');
});

/**
 * Handle user logout
 */
controller.get('/api/v1/logout', (req, res) => {
    if (req.session.logged_in && req.session.user_info) {
        logUserActivity('logged out', req.session.user_info.username);
    }
    req.session.logged_in = false;
    req.session.user_info = { username: "Guest", role: "Visitor" };
    return res.redirect('/login');
});

controller.post('/api/v1/addMod', async (req, res) => {
    const email = req.body.modemail;
    console.log(email);
})
controller.post('/api/v1/removeMod', async (req, res) => {
    const email = req.body.modemail;
    console.log(email);
})
controller.get('/api/v1/getAllMods', (req, res) => {

});

controller.get('/api/v1/getSets/:userID', async (req, res) => {
    const userID = req.params.userID;
    const sets = await getSetsFromuID(Number(userID));
    res.send(sets);
});

/**
 * Dashboard or Home page - redirect to log in if user is not authenticated
 */
controller.get('/', async (req, res) => {
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

controller.get('/newset', (req, res) => {
    if (req.session.logged_in && req.session.user_info) {
        if (req.session.user_info.role === "user") return res.render("new_set");
    }
    return res.redirect('/login');
});



controller.get('/test', async (req,res) =>{
    let user = await new UserCreator().login("admin@flick.com", "a!1w27T?twxB")
    console.log(user);
    res.send(user);
})

controller.post('/api/v2/login', async (req, res) => {
    let login = await new UserCreator().login(req.body.email, req.body.password);
    if (login instanceof Regular){
        logUserActivity("logged in", "regular " + login.username);
    }

    else if (login instanceof Moderator){
        logUserActivity("logged in", "moderator " + login.username);
    }
    else if (login instanceof Administrator){
        logUserActivity("logged in", "administrator " + login.username);
    }
    else {
        switch (login) {
            case LoginStatus.USER_DOES_NOT_EXIST:
                console.log("User does not exist");
                break;
            case LoginStatus.WRONG_PASSWORD:
                console.log("Incorrect password");
                break;
            case LoginStatus.DATABASE_FAILURE:
                console.log("Database failure");
                break;
            default:
                console.log("Other login error");
                break;
        }
    }

});

/**
 * Catch-all route for undefined pages (404 error)
 */
controller.get('*', (req, res) => res.status(404).sendFile(pub + "notfound.html"));

// Start the server
controller.listen(port, () => console.log("Server running on 24.72.0.105:" + port));
