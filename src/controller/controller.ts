import path from 'path';
import axios from 'axios';
import {
    setupExpress,
    getCookie, logUserActivity, isRegular, isModerator, isAdmin,
} from "../model/utility";
import { handleLogin } from "../model/apiHandles/handleLogin";
import { handleRegistration } from "../model/apiHandles/handleRegistration";
import { handleNewSet } from "../model/apiHandles/handleNewSet";
import { handleGetSets } from "../model/apiHandles/handleGetSets";
import { handleGetCardsInSet } from "../model/apiHandles/handleGetCardsInSet";
import { UserService } from "../model/user/user.service";
import { Role } from '../model/user/user.types';
import { Category, SubCategory_Technology, SubCategory_CourseSubjects, SubCategory_Law, SubCategory_Medical, SubCategory_Military, SubCategory_Language } from '../model/cardSet/cardset.model';

const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../../src/view');
export const port = 3000;

const controller = setupExpress(pub, view);

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
 * Retrieves all card sets for the current user
 * @param req - Express request object
 * @param res - Express response object containing card sets
 * @throws {Error} If fetching card sets fails
 */
controller.get('/api/v2/getCardSets', async (req, res) => {
    try {
        await handleGetSets(req, res);
    } catch (error) {
        console.error('Error fetching card sets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * Retrieves all cards within a specific set
 * @param req - Express request object containing set ID
 * @param res - Express response object containing cards
 * @throws {Error} If fetching cards fails
 */
controller.get('/api/v2/getCards', async (req, res) => {
    try {
        await handleGetCardsInSet(req, res);
    } catch (error) {
        console.error('Error fetching cards in set:', error);
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
        logUserActivity('visited dashboard', req.session.user.username);
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
