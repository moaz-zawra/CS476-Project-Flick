import path from 'path';
import express from 'express';
import axios from 'axios';
import {
    setupExpress,
    getCookie,
} from "../model/utility";
import { handleLogin } from "../model/handleLogin";
import { handleRegistration } from "../model/handleRegistration";
import { handleNewSet } from "../model/handleNewSet";
import { handleGetSets } from "../model/handleGetSets";
import { handleGetCardsInSet } from "../model/handleGetCardsInSet";
import { setupDashboard } from "../model/dashboard";

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

// View Routes
controller.get('/', async (req, res) => {
    try {
        await setupDashboard(req, res);
    } catch (error) {
        console.error('Error setting up dashboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

controller.listen(port, () => console.log(`Server running on http://localhost:${port}`));
