import path from 'path';
import axios from 'axios';
import express from 'express';
import {
    getCookie,
    isAdminUser,
    isAuthenticated,
    isModeratorUser,
    isNotAuthenticated,
    isRegularUser,
    logUserActivity,
    setupExpress,
} from "../model/utility";
import {handleLogin} from "../model/apiHandles/handleLogin";
import {handleRegistration} from "../model/apiHandles/handleRegistration";
import {handleNewSet} from "../model/apiHandles/handleNewSet";
import {UserService} from "../model/user/user.service";
import {Role} from '../model/user/user.types';
import {
    Category,
    SubCategory_CourseSubjects,
    SubCategory_Language,
    SubCategory_Law,
    SubCategory_Medical,
    SubCategory_Military,
    SubCategory_Technology
} from '../model/cardSet/cardset.model';
import {Regular} from "../model/user/user.roles";
import {CardSetService} from "../model/cardSet/cardset.service";
import {CardSetGetStatus} from "../model/cardSet/cardset.types";
import {CardService} from "../model/card/card.service";
import {CardGetStatus} from "../model/card/card.types";

const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../../src/view');

const GETOK = 200;
const POSTOK = 201;
const NOTAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const SERVERERROR = 500;
export const port = 3000;

const controller = setupExpress(pub, view);

class APIService{
    //All of these functions assume req.session.user has already been authenticated in the route beforehand
    static async handleGetSets(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const result = await user.getAllSets();

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            res.status(SERVERERROR).render('error', {action: 'APIService.handleGetSets()', error:'Database Error'})
        }
        if(result === CardSetGetStatus.USER_HAS_NO_SETS){
            res.status(GETOK).json([""]);
        }
        else res.status(GETOK).json(result);
    }

    static async handleGetSet(req: express.Request, res: express.Response): Promise<void> {
        const setID = parseInt(req.query.setID as string);
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const result = await user.getSet(setID);

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            res.status(SERVERERROR).render('error', {action: 'APIService.handleGetSet()', error:'Database Error'})
        }
        if(result === CardSetGetStatus.SET_DOES_NOT_EXIST){
            res.status(NOTFOUND).render('error', {action: 'APIService.handleGetSet()', error:'Requested set does not exist in DB'})
        }
        else res.status(GETOK).json(result);
    }

    static async handleGetCardsInSet(req: express.Request, res: express.Response): Promise<void> {
        const setID = parseInt(req.query.setID as string);
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const result = await user.getCards(setID);

        if(result === CardGetStatus.DATABASE_FAILURE){
            res.status(SERVERERROR).render('error', {action: 'APIService.handleGetCardsInSet()', error:'Database Error'})
        }
        if(result === CardGetStatus.SET_DOES_NOT_EXIST){
            res.status(NOTFOUND).render('error', {action: 'APIService.handleGetCardsInSet()', error:'Requested set does not exist in DB'})
        }
        if(result === CardGetStatus.SET_HAS_NO_CARDS){
            res.status(GETOK).json([""]);
        }
        else res.status(GETOK).json(result);
    }

    static async handleGetSharedSets(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const result = await user.getSharedSets();

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            res.status(SERVERERROR).render('error', {action: 'APIService.handleGetSharedSets()', error:'Database Error'})
        }
        if(result === CardSetGetStatus.USER_HAS_NO_SETS){
            res.status(GETOK).json([""]);
        }
        else res.status(GETOK).json(result);
    }

    static async handleGetUserActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const time_period = req.query.time_period as string;
        if(time_period === "alltime"){
            const result = await UserService.getUserActivityAllTime(user);
            if(result){
                res.status(GETOK).json(result);
            } else res.status(NOTFOUND).json([""]);
        }
        else{
            const result = await UserService.getUserActivityLast7Days(user);
            if(result){
                res.status(GETOK).json(result);
            } else res.status(NOTFOUND).json([""]);
        }
    }

    static async handleGetRegulars(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const result = UserService.getRegularUsers();
    }
}

//All API routes generally require REGULAR authentication, some special routes related to user administration require MODERATOR authentication. Routes for managing MODERATORS require ADMINISTRATOR authentication

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GET API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves all card sets for the current user
 * @param req - Express request object
 * @param res - Express response object containing card sets
 * @throws {Error} If fetching card sets fails
 */
controller.get('/api/getSets', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getSets', error: e});
    }
})

/**
 * Retrieves all cards within a specific set
 * @param req - Express request object containing set ID
 * @param res - Express response object containing cards
 * @throws {Error} If fetching cards fails
 */
controller.get('/api/getSet', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getSet', error: e});
    }
})
controller.get('/api/getSharedSets', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getSharedSets', error: e});
    }
})
controller.get('/api/getCardsInSet', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})
controller.get('/api/getUserActivity', isAuthenticated, isModeratorUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getUserActivity', error: e});
    }
})
controller.get('/api/getRegulars', isAuthenticated, isModeratorUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getRegulars', error: e});
    }
})
controller.get('/api/getModerators', isAuthenticated, isAdminUser, logUserActivity, async (req, res) => {
    try{

    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//POST API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.post('/api/handleLogin', isNotAuthenticated, async (req, res) => {

})
controller.post('/api/handleRegister', isNotAuthenticated , async (req, res) => {

})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.delete('/api/deleteSet', isAuthenticated, isRegularUser, async (req, res) => {

})
controller.delete('/api/deleteCard', isAuthenticated, isRegularUser, async (req, res) => {

})
controller.delete('/api/deleteUser', isAuthenticated, isModeratorUser, async (req, res) => {

})



/**
 * Handles user login requests
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 * @throws {Error} If login process fails
 */
controller.post('/api/v2/login', async (req, res) => {
    try {
        await handleLogin(req, res);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Handles user registration requests
 * @param req - Express request object containing registration data
 * @param res - Express response object
 * @throws {Error} If registration process fails
 */
controller.post('/api/v2/register', async (req, res) => {
    try {
        await handleRegistration(req, res);
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Handles creation of new card sets
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If set creation fails
 */
controller.post('/api/v2/create-set', async (req, res) => {
    try {
        await handleNewSet(req, res);
    } catch (error) {
        console.error('Error creating new set:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Handles deletion of card sets
 * @param req - Express request object containing set ID
 * @param res - Express response object
 * @throws {Error} If set deletion fails
 */
controller.post('/api/v2/delete-set', async (req, res) => {
    try {
        await handleNewSet(req, res);
    } catch (error) {
        console.error('Error creating new set:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Handles user logout
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If logout process fails
 */
controller.get('/api/v2/logout', (req, res) => {
    try {
        delete req.session.user;
        res.redirect('/');
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


/**
 * Renders the dashboard for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If fetching user data or card sets fails
 */
controller.get('/', async (req, res) => {
    if(req.session.user){
        if(req.session.user.role == Role.REGULAR){
            try{
                const cookie = getCookie(req);
                const response = await axios.get('http://localhost:'+port+'/api/v2/getCardSets', {
                    headers: {
                        cookie
                    }
                });

                let sets = response.data;
                return res.render('dashboard_new', {
                    user: req.session.user,
                    uID: await UserService.getIDOfUser(req.session.user),
                    status: req.query.status,
                    sets:sets
                });
            } catch(error){
                console.error("Error fetching card sets:", error);
                res.status(500).send("Error fetching card sets");
            }
        }
    } else res.redirect('/login');
});

/**
 * Renders the login page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('login', { status: req.query.status });
});

/**
 * Renders the registration page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { status: req.query.status });
});

/**
 * Renders the account page for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/account', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('account', { account: req.session.user });
});

/**
 * Renders the view set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
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

/**
 * Renders the new set creation page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/new_set', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    
    // Create a mapping of category names
    const categoryNames = {
        [Category.Language]: 'Language',
        [Category.Technology]: 'Technology',
        [Category.CourseSubjects]: 'Course Subjects',
        [Category.Law]: 'Law',
        [Category.Medical]: 'Medical',
        [Category.Military]: 'Military'
    };

    res.render("new_set", {
        categories: Category,
        categoryNames,
        subcategories: {
            [Category.Language]: SubCategory_Language,
            [Category.Technology]: SubCategory_Technology,
            [Category.CourseSubjects]: SubCategory_CourseSubjects,
            [Category.Law]: SubCategory_Law,
            [Category.Medical]: SubCategory_Medical,
            [Category.Military]: SubCategory_Military
        }
    });
});

/**
 * Handles 404 errors by serving the not found page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('*', (req, res) => res.status(404).sendFile(path.join(pub, "notfound.html")));

// Start the server
if (require.main === module) {
    controller.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default controller;
