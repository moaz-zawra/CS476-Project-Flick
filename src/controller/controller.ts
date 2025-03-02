import path from 'path';
import axios from 'axios';
import {
    setupExpress,
    getCookie, logUserActivity, isRegular, isModerator, isAdmin,
} from "../model/utility";
import { handleLogin } from "../model/handleLogin";
import { handleRegistration } from "../model/handleRegistration";
import { handleNewSet } from "../model/handleNewSet";
import { handleGetSets } from "../model/handleGetSets";
import { handleGetCardsInSet } from "../model/handleGetCardsInSet";
import { Role } from '../types/types';
import {UserService} from "../model/user";

const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../view');
export const port = 3000;

const controller = setupExpress(pub, view);
// API Routes
controller.post('/api/v2/login', async (req, res) => {
    try {
        await handleLogin(req, res);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

controller.post('/api/v2/register', async (req, res) => {
    try {
        await handleRegistration(req, res);
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

controller.post('/api/v2/create-set', async (req, res) => {
    try {
        await handleNewSet(req, res);
    } catch (error) {
        console.error('Error creating new set:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

controller.get('/api/v2/getCardSets', async (req, res) => {
    try {
        await handleGetSets(req, res);
    } catch (error) {
        console.error('Error fetching card sets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

controller.get('/api/v2/getCards', async (req, res) => {
    try {
        await handleGetCardsInSet(req, res);
    } catch (error) {
        console.error('Error fetching cards in set:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

controller.get('/api/v2/logout', (req, res) => {
    try {
        delete req.session.user;
        res.redirect('/');
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
controller.get('/test', (req, res) => {
    res.render("dashboard_new");
})
// View Routes
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
                    user: req.session.user,
                    uID: await UserService.getIDOfUser(req.session.user),
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
controller.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { status: req.query.status });
});

controller.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { status: req.query.status });
});

controller.get('/account', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('account', { account: req.session.user });
});

controller.post('/view_set', async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const cookie = getCookie(req);
        let set;

        try {
            set = JSON.parse(req.body.set);
        } catch (parseError) {
            console.error('Error parsing set JSON:', parseError);
            res.status(400).json({error: 'Invalid set data'});
        }

        const response = await axios.get(`http://localhost:${port}/api/v2/getCards`, {
            params: { set },
            headers: { cookie }
        });

        res.render("view_set", { set, cards: response.data });
    } catch (error) {
        console.error('Error fetching set data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

controller.get('/newset', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render("new_set");
});

// 404 catch-all route
controller.get('*', (req, res) => res.status(404).sendFile(path.join(pub, "notfound.html")));

controller.listen(port, () => console.log("Server running on 24.72.0.105:" + port));
