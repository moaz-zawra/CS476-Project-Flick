//Include nodeJS libraries
import path = require('path');
import express = require('express');

//Include functions and interfaces from other files
import {userLogin} from "../model/userLogin";
import {userRegister} from "../model/userRegister";
import {setupExpress, makeUser} from "../model/utility";

//constant to the Views folder
const views = path.join(__dirname, '../view/');

//constant to the Public folder
const pub = path.join(__dirname,'../../public/');

//expressJS setup
let controller = setupExpress()

controller.use(express.static(pub));
//Port that the server will run on
let port = 3000;




//API Endpoints
controller.post('/api/v1/login', function(req, res) {
    //Create user Object - the request is a 'POST' request, submitted by the form on login.html. We get these fields by using req.body.<fieldName>
    let user = makeUser(req.body.email, req.body.password);
    //Call the userLogin() function, which attempts a connection with the DB, looks up the users email, grabs the saved hash we have for the user, and compare it against
    //whatever was entered
    let loginStatus = userLogin(user);
    //Include the login status in our response
    res.send(loginStatus);
})
controller.post('/api/v1/register', function(req, res) {
    //Create user Object - the request is a 'POST' request, submitted by the form on login.html. We get these fields by using req.body.<fieldName>
    let user = makeUser(req.body.email, req.body.password);
    //Call the userRegister() function, which attempts a connection with the DB, checks if the user exists already, and attempts to add the user as an entry to the users table.
    let registerStatus = userRegister(user);
    //Include the register status in our response
    res.send(registerStatus);
})

controller.get('/api/v1/getSets/:userID', function(req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
})

controller.post('/api/v1/addSet', function(req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
})

controller.get('/api/v1/getSet/:userID-:setID', function(req, res) {
    res.status(501).sendFile(pub + "unimplemented.html");
})

//Get request for pages
controller.get('/', function (req, res) {
    res.sendFile(views + 'index.html');
})
controller.get('/login', function (req, res) {
    res.sendFile(views + '/login.html');
})
controller.get('/register', function (req, res) {
    res.sendFile(views + '/register.html');
})
controller.get('/account', function (req, res) {
    //501 => Unimplemented
    res.status(501).sendFile(pub + "unimplemented.html");
})

controller.get('*', function (req, res) {
    res.status(404).sendFile(pub + "notfound.html");
})

controller.listen(port, () => {
    console.log("Server running on 24.72.0.105:" + port);
})
