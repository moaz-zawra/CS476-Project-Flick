//Include nodeJS libraries
import path = require('path');
import express = require('express');

//Include functions and interfaces from other files
import {userLogin, loginStatus} from "../model/userLogin";
import {userRegister, registerStatus} from "../model/userRegister";
import {setupExpress, makeUser} from "../model/utility";

//constant to the Views folder
const views = path.join(__dirname, '../view/');

//constant to the Public folder
const pub = path.join(__dirname,'../../public/');

//Port that the server will run on
const port = 3000;

//expressJS setup
let controller = setupExpress()
controller.use(express.static(pub));

//Setup default session
controller.use((req, res, next) => {
    if (!req.session.logged_in) {
        req.session.logged_in = false; // Default value
    }
    if (!req.session.user_info) {
        req.session.user_info = { username: "Guest", role: "visitor" }; // Default values
    }
    next();
});


//API Endpoints
controller.post('/api/v1/login', function(req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    //Create user Object - the request is a 'POST' request, submitted by the form on login.html. We get these fields by using req.body.<fieldName>
    let user = makeUser(req.body.email, req.body.password);
    console.log(user);
    //Call the userLogin() function, which attempts a connection with the DB, looks up the users email, grabs the saved hash we have for the user, and compare it against
    //whatever was entered
    userLogin(user).then((status) => {
        if (status === loginStatus.WrongPassword) {
            res.send("Login failed due to Wrong Password");
        }
        else if (status === loginStatus.DoesNotExist){
            res.send("Login failed because email is not registered")
        }
        else if (status === loginStatus.Success) {
            req.session.logged_in = true;
            req.session.user_info = {username: user.email, role:"user"};
            res.redirect('/');
        }
        else {
            res.send("Login failed due to a database error (thats not good)");
        }
    });
})
controller.post('/api/v1/register', function(req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    //Create user Object - the request is a 'POST' request, submitted by the form on login.html. We get these fields by using req.body.<fieldName>
    let user = makeUser(req.body.email, req.body.password);

    //Call the userRegister() function, which attempts a connection with the DB, checks if the user exists already, and attempts to add the user as an entry to the users table.
    userRegister(user).then((status) => {
        if (status === registerStatus.Success){
            res.send("Registration was a success")
        }
        else if (status === registerStatus.UserAlreadyExists){
            res.send("Registration failed because email is used");
        }
        else{
            res.send("Registration failed due to a database error (thats not good)");
        }
    });
})

controller.get('/api/v1/getSets/:userID', function(req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    res.status(501).sendFile(pub + "unimplemented.html");
})
controller.post('/api/v1/addSet', function(req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    res.status(501).sendFile(pub + "unimplemented.html");
})
controller.get('/api/v1/getSet/:userID-:setID', function(req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    res.status(501).sendFile(pub + "unimplemented.html");
})

//Get request for pages
controller.get('/', function (req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    // @ts-ignore
    if (req.session.logged_in){
        res.sendFile(views + 'index.html');
    }
    else{
        res.redirect('/login');
    }

})
controller.get('/login', function (req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    if (req.session.logged_in){
        res.redirect('/');
    }
    else{
        res.sendFile(views + '/login.html');
    }
})
controller.get('/register', function (req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    if (req.session.logged_in){
        res.redirect('/');
    }
    else{
        res.sendFile(views + '/register.html');
    }
})
controller.get('/account', function (req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    //501 => Unimplemented
    res.status(501).sendFile(pub + "unimplemented.html");
})

controller.get('*', function (req, res) {
    console.log("Logged In?: " + req.session.logged_in);
    res.status(404).sendFile(pub + "notfound.html");
})

controller.listen(port, () => {
    console.log("Server running on 24.72.0.105:" + port);
})
