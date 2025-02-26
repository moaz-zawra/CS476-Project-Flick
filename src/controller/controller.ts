// Include NodeJS libraries
import path = require('path');
import axios from 'axios';
// Include functions and interfaces from other files
import {
    setupExpress,
    logUserActivity, getCookie,
} from "../model/utility";
import {handleLogin} from "../model/handleLogin";
import {handleRegistration} from "../model/handleRegistration";
import {handleNewSet} from "../model/handleNewSet";
import {Role} from "../types/types";
import {handleGetSets} from "../model/handleGetSets";
// Paths to public and view directories
const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../view');



// Server port
const port = 3000;

// ExpressJS setup
const controller = setupExpress(pub, view);

controller.post('/api/v2/login', async (req,res) =>{
    await handleLogin(req, res);
});
controller.post('/api/v2/register', async (req,res) =>{
    await handleRegistration(req, res);
});
controller.post('/api/v2/create-set', async(req,res) =>{
    await handleNewSet(req,res);
});

controller.get('/api/v2/getCardSets', async(req,res) =>{
    await handleGetSets(req,res)
});

controller.get('/api/v2/logout', (req,res) =>{
    req.session.user = undefined;
    res.redirect('/');
});
/**
 * Dashboard or Home page
 */
controller.get('/', async (req, res) => {
    if(req.session.user){
        logUserActivity('visited dashboard', req.session.user.username);
        if(req.session.user.role == Role.ADMINISTRATOR){}
        if(req.session.user.role == Role.MODERATOR){}
        if(req.session.user.role == Role.REGULAR){
            try{
                const cookie = getCookie(req);
                const response = await axios.get('http://localhost:'+port+'/api/v2/getCardSets', {
                    headers: {
                        cookie
                    }
                });

                let sets = response.data;
                return res.render('dashboard', {
                    uname: req.session.user.username,
                    status: req.query.status,
                    sets: sets
                });
            } catch(error){
                console.error("Error fetching card sets:", error);
                res.status(500).send("Error fetching card sets");
            }
        }
    } else res.redirect('/login');

});

/**
 * Login page
 */
controller.get('/login', (req, res) => {
    if (req.session.user) res.redirect('/');
    else return res.render('login', { status: req.query.status });
});

/**
 * Registration page
 */
controller.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    return res.render('register', { status: req.query.status });
});

/**
 * Account settings page (Not yet implemented)
 */
controller.get('/account', (req, res) => {
    if (req.session.user) res.render('account' , { account: req.session.user });
    else res.redirect('/login');
});

/**
 * Views for moderator actions (Not yet implemented)
 */
controller.get('/moderator/report', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/moderator/review', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));
controller.get('/moderator/useradmin', (req, res) => res.status(501).sendFile(pub + "unimplemented.html"));

controller.get('/newset', (req, res) => {
    if(req.session.user){
        res.render("new_set");
    }
});

/**
 * Catch-all route for undefined pages (404 error)
 */
controller.get('*', (req, res) => res.status(404).sendFile(pub + "notfound.html"));

// Start the server
controller.listen(port, () => console.log("Server running on 24.72.0.105:" + port));
