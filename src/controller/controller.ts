import express = require('express');
import path = require('path');
import mysql = require('mysql2');
import {dbAddUser} from "./model/dbAddUser";
import {User} from "./model/dbAddUser";

let controller = express();
controller.use(express.json());
controller.use(express.urlencoded({ extended: true }));

let port = 3000;``
const views = path.join(__dirname, 'view/');
console.log(views);
controller.get('/', function (req, res) {
    res.sendFile(views+'index.html');
})
controller.get('/test', function (req, res) {
    let user: User = {
        email: "test@test.com",
        password:"awesomepassword111"
    };
    dbAddUser(user)
})
controller.get('/login', function (req, res) {
    res.sendFile(views + '/login.html');
})
controller.get('/register', function (req, res) {
    res.sendFile(views + '/register.html');
})
controller.post('/login', function (req, res) {
    const {email, password} = req.body;
    let user: User = {
        email: email,
        password: password,
    }
    console.log("login request received: ", user);
})
controller.post('/register', function (req, res) {
    const {email, password, _} = req.body;
    let user: User = {
        email: email,
        password: password,
    }
    console.log("register request received: ", user);
})


controller.listen(port, () => {
    console.log("Server running on localhost: " + port);
})