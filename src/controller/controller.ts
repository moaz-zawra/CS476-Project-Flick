// Include NodeJS libraries
import path = require('path');
import express = require('express');

// Include functions and interfaces from other files
import { userLogin, loginStatus, getuIDFromEmail } from "../model/userLogin";
import { userRegister, registerStatus } from "../model/userRegister";
import { setupExpress, makeUser, setDefaultSession } from "../model/utility";

// Constant to the Public folder
const pub = path.join(__dirname, '../../public/');
// Constant to the View folder
const view = path.join(__dirname, '../view');
// Port that the server will run on
const port = 3000;

// ExpressJS setup
const controller = setupExpress(pub, view);

// Set default session values for new users
setDefaultSession(controller);

// API Endpoints

// Handle login attempts
controller.post('/api/v1/login', function (req, res) {
    // Create user object from form input
    let user = makeUser(req.body.email, req.body.password);

    // Authenticate user by checking credentials in the database
    userLogin(user).then((status) => {
        if (status === loginStatus.WrongPassword) {
            res.redirect(`/login?status=wrong-password`);
        } else if (status === loginStatus.DoesNotExist) {
            res.redirect(`/login?status=does-not-exist`);
        } else if (status === loginStatus.Success) {
            // Set session values on successful login
            req.session.logged_in = true;
            req.session.user_info = { username: user.email, role: "user" };
            res.redirect('/');
        } else {
            // Redirect to login with error status in case of unexpected failure
            res.redirect('/login?status=error');
        }
    });
});

// Handle user registration
controller.post('/api/v1/register', function (req, res) {
    // Create user object from form input
    let user = makeUser(req.body.email, req.body.password);

    // Attempt to register user in the database
    userRegister(user).then((status) => {
        if (status === registerStatus.Success) {
            // Registration successful, redirect to login
            res.redirect('/login?status=registration-success');
        } else if (status === registerStatus.UserAlreadyExists) {
            // User already exists, redirect back to registration with status message
            res.redirect('/register?status=user-already-exists');
        } else {
            // Registration failed due to an unknown error
            res.redirect('/register?status=error');
        }
    });
});

// API routes for managing user sets (Not yet implemented)
controller.get('/api/v1/getSets/:userID', function (req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
});
controller.post('/api/v1/addSet', function (req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
});
controller.get('/api/v1/getSet/:userID-:setID', function (req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
});

// Handle user logout
controller.get('/api/v1/logout', function (req, res) {
    // Reset session values
    req.session.logged_in = false;
    req.session.user_info = { username: "Guest", role: "Visitor" };
    res.redirect('/login');
});

// Get request for pages

// Home page - redirect to login if user is not authenticated
controller.get('/', function (req, res) {
    // @ts-ignore
    if (req.session.logged_in) {
        res.render("user_dashboard");
    } else {
        res.redirect('/login');
    }
});

// Login page - if already logged in, redirect to home
controller.get('/login', function (req, res) {
    if (req.session.logged_in) {
        res.redirect('/');
    } else {
        const status = req.query.status; // Get status message if available
        res.render('login', { status });
    }
});

// Registration page - if already logged in, redirect to home
controller.get('/register', function (req, res) {
    if (req.session.logged_in) {
        res.redirect('/');
    } else {
        const status = req.query.status; // Get status message if available
        res.render('register', { status });
    }
});

// Account settings page (Not yet implemented)
controller.get('/account', function (req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
});

// Views for moderator actions (Not yet implemented)
{
    controller.get('/moderator/dashboard', function (req, res) {
        res.status(501).sendFile(pub + "unimplemented.html");
    });
    controller.get('/moderator/report', function (req, res) {
        res.status(501).sendFile(pub + "unimplemented.html");
    });
    controller.get('/moderator/review', function (req, res) {
        res.status(501).sendFile(pub + "unimplemented.html");
    });
    controller.get('/moderator/useradmin', function (req, res) {
        res.status(501).sendFile(pub + "unimplemented.html");
    });

}

controller.get('/newset', function (req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
});

// Route for testing functions
controller.get('/test', function (req, res) {
    res.send("no test setup");
});

// Catch-all route for undefined pages (404 error)
controller.get('*', function (req, res) {
    res.status(404).sendFile(pub + "notfound.html");
});

// Start the server
controller.listen(port, () => {
    console.log("Server running on 24.72.0.105:" + port);
});
