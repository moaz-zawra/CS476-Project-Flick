import path from 'path';
import axios from 'axios';
import express from 'express';
import methodOverride from 'method-override';
import {
    getCookie,
    isAdminUser,
    isAuthenticated,
    isModeratorUser,
    isNotAuthenticated,
    isRegular,
    isRegularUser,
    logUserActivity,
    setupExpress,
} from "../model/utility";
import {UserService} from "../model/user/user.service";
import {LoginStatus, RegisterStatus, UserAction, UserChangeStatus} from '../model/user/user.types';
import {
    Category,
    makeCardSet,
    SubCategory_CourseSubjects,
    SubCategory_Language,
    SubCategory_Law,
    SubCategory_Medical,
    SubCategory_Military,
    SubCategory_Technology
} from '../model/cardSet/cardset.model';
import {Administrator, Moderator, Regular} from "../model/user/user.roles";
import {CardSetAddStatus, CardSetGetStatus, CardSetRemoveStatus} from "../model/cardSet/cardset.types";
import {CardAddStatus, CardGetStatus} from "../model/card/card.types";
import {UserCreator} from "../model/user/user.auth";
import {makeCard} from "../model/card/card.model";
import { CardSetService } from '../model/cardSet/cardset.service';

const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../../src/view');

const GETOK = 200;
const POSTOK = 201;
const BADREQUEST = 400;
const NOTAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const SERVERERROR = 500;
const CONFLICT = 409;
export const port = 3000;

const controller = setupExpress(pub, view);

controller.use(methodOverride('_method'))

/**
 * Helper function to handle redirection based on status.
 *
 * @param res - The Express response object.
 * @param response_code
 * @param route
 * @param status - The registration status to be included in the query string.
 */
function redirectWithStatus(res: express.Response, response_code: number, route: string, status: string): void {
    return res.status(response_code).redirect(`/${route}?status=${status}`);
}


class APIService{
    //All of these functions assume req.session.user has already been authenticated in the route beforehand

    //GET handlers
    static async handleGetSets(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const result = await user.getAllSets();

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            res.status(SERVERERROR).render('error', {action: 'APIService.handleGetSets()', error:'Database Error'})
        }
        if(result === CardSetGetStatus.USER_HAS_NO_SETS){
            res.status(GETOK).json([]);
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
            res.status(GETOK).json([]);
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
            res.status(GETOK).json([]);
        }
        else res.status(GETOK).json(result);
    }
    static async handleGetUserActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const time_period = req.query.time_period as string;
        if(time_period === "alltime"){
            const result = await user.getAllTimeActivity();
            if(result){
                res.status(GETOK).json(result);
            } else res.status(NOTFOUND).json([]);
        }
        else{
            const result = await user.getWeeklyActivity();
            if(result){
                res.status(GETOK).json(result);
            } else res.status(NOTFOUND).json([]);
        }
    }

    static async handleGetUsersActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = Object.assign(new Moderator("", ""), req.session.user);
        const time_period = req.query.time_period as string;
        if(time_period === "alltime"){
            const result = await user.getUsersAllTimeActivity()
            if(result){
                res.status(GETOK).json(result);
                return;
            } else res.status(NOTFOUND).json([]);
        }
        else{
            const result = await user.getUsersWeeklyActivity()
            if(result){
                res.status(GETOK).json(result);
                return;
            } else res.status(NOTFOUND).json([""]);
        }
    }

    static async handleGetRegulars(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = Object.assign(new Moderator("", ""), req.session.user);
        const result = await user.getRegularUsers()
        if(result){
            res.status(GETOK).json(result);
            return;
        }
        res.status(NOTFOUND).json([""]);
    }
    static async handleGetModerators(req: express.Request, res: express.Response): Promise<void> {
        const user: Administrator = Object.assign(new Administrator("", ""), req.session.user);
        const result = await user.getModeratorUsers()
        if(result){
            res.status(GETOK).json(result);
            return;
        }
        res.status(NOTFOUND).json([""]);
    }

    //POST handlers
    static async handleLogin(req: express.Request, res: express.Response): Promise<void> {
        const user = await new UserCreator().login(req.body.identifier, req.body.password);
        if(user === LoginStatus.USER_DOES_NOT_EXIST){
            redirectWithStatus(res, NOTFOUND,'login','does-not-exist');
        }
        else if (user === LoginStatus.WRONG_PASSWORD){
            redirectWithStatus(res, NOTAUTH,'login','wrong-password');
        }
        else if (user === LoginStatus.OTHER || user === LoginStatus.DATABASE_FAILURE){
            redirectWithStatus(res, SERVERERROR,'login','error');
        }
        else{
            req.session.user = user;
            res.redirect('/')
        }
    }
    static async handleRegister(req: express.Request, res: express.Response): Promise<void> {
        const { username, email, password, cpassword } = req.body;
        if(username && email && password && cpassword){
            const result = await new UserCreator().registerUser(username,email,password,cpassword);
            if(result === RegisterStatus.SUCCESS){
                redirectWithStatus(res, POSTOK,'login','registration-success');
            }
            else if(result === RegisterStatus.USERNAME_USED){
                redirectWithStatus(res, CONFLICT,'register','username-used');
            }
            else if(result === RegisterStatus.EMAIL_USED){
                redirectWithStatus(res, CONFLICT,'register','email-used');
            }
            else if(result === RegisterStatus.BAD_PASSWORD){
                redirectWithStatus(res, BADREQUEST,'register','bad-password');
            }
            else if(result === RegisterStatus.PASSWORD_MISMATCH){
                redirectWithStatus(res, BADREQUEST,'register','mismatch-password');
            }
            else if(result === RegisterStatus.DATABASE_FAILURE){
                redirectWithStatus(res, SERVERERROR,'register','error');
            }
        } else redirectWithStatus(res, BADREQUEST,'register','missing-fields');
    }
    static async handleNewSet(req: express.Request, res: express.Response): Promise<void> {
        const user = Object.assign(new Regular("", ""), req.session.user);
        const uID = await UserService.getIDOfUser(user);

        const {setName, category, subcategory, setDesc} = req.body;
        if(setName && category && subcategory && setDesc){
            const set = makeCardSet(uID, setName, category, subcategory, setDesc);
            const result = await user.addSet(set);

            if(result === CardSetAddStatus.SUCCESS){
                UserService.logUserAction(user, UserAction.NEWSET);
                redirectWithStatus(res,POSTOK,'','success');
            }
            else if(result === CardSetAddStatus.MISSING_INFORMATION){
                redirectWithStatus(res,BADREQUEST,'','missing-fields');
            }
            else if(result === CardSetAddStatus.NAME_USED){
                redirectWithStatus(res,CONFLICT,'','name-used');
            }
            else if(result === CardSetAddStatus.DATABASE_FAILURE){
                redirectWithStatus(res,SERVERERROR,'','error');
            }
        } else redirectWithStatus(res, BADREQUEST,'','missing-fields');
    }
    static async handleNewCard(req: express.Request, res: express.Response): Promise<void> {
        const user = Object.assign(new Regular("", ""), req.session.user);
        const { front_text, back_text, setID } = req.body;

        if(front_text && back_text && setID){
            UserService.logUserAction(user, UserAction.NEWSET);
            const card = makeCard(setID, front_text, back_text);
            const result = await user.addCardToSet(card);

            if(result === CardAddStatus.SUCCESS){
                redirectWithStatus(res,POSTOK,'/','success');
            }
            else if(result === CardAddStatus.MISSING_INFORMATION){
                redirectWithStatus(res,BADREQUEST,'/','missing-fields');
            }
            else if(result === CardAddStatus.SET_DOES_NOT_EXIST){
                redirectWithStatus(res,NOTFOUND,'/','set-does-not-exist');
            }
            else if(result === CardAddStatus.DATABASE_FAILURE){
                redirectWithStatus(res,SERVERERROR,'/','error');
            }
        } else redirectWithStatus(res, BADREQUEST,'/','missing-fields');
    }
    
    static async handleBan(req: express.Request, res: express.Response): Promise<void> {}
    static async handleUnBan(req: express.Request, res: express.Response): Promise<void> {}

    //PUT handlers
    static async handleEditUser(req: express.Request, res: express.Response): Promise<void> {
        const action = req.body.action;

        if (action === 'change_details') {
    
            const {username, email, oldUsername, oldEmail} = req.body;
            if(username && email && oldUsername && oldEmail){
                if (username === oldUsername && email === oldEmail){
                    redirectWithStatus(res,POSTOK,'account','');
                }else{
                    const user: Regular = Object.assign(new Regular("", ""), req.session.user);
                    const result = await user.changeDetails(username,email);
    
                    if(result === UserChangeStatus.SUCCESS){
                        req.session.user = Object.assign(req.session.user, { username, email });
                        redirectWithStatus(res,POSTOK,'account','success');
                    } else if(result === UserChangeStatus.USER_DOES_NOT_EXIST){
                        redirectWithStatus(res,BADREQUEST,'account','user-does-not-exist');
                    } else if(result === UserChangeStatus.DATABASE_FAILURE){
                        redirectWithStatus(res,SERVERERROR,'account','error');
                    } else if(result === UserChangeStatus.INCORRECT_PASSWORD){
                        redirectWithStatus(res,NOTAUTH,'account','incorrect-password');
                    }
                }
            }else redirectWithStatus(res,BADREQUEST,'account','missing-fields');
    
        } else if (action === 'change_password') {
            const {current_password, new_password} = req.body;
            if(current_password && new_password){
                const user: Regular = Object.assign(new Regular("", ""), req.session.user);
    
                const result = await user.changePassword(current_password,new_password);
    
                if(result === UserChangeStatus.SUCCESS){
                    redirectWithStatus(res,POSTOK,'account','success');
                } else if(result === UserChangeStatus.USER_DOES_NOT_EXIST){
                    redirectWithStatus(res,BADREQUEST,'account','user-does-not-exist');
                } else if(result === UserChangeStatus.DATABASE_FAILURE){
                    redirectWithStatus(res,SERVERERROR,'account','error');
                } else if(result === UserChangeStatus.INCORRECT_PASSWORD){
                    redirectWithStatus(res,NOTAUTH,'account','incorrect-password');
                }
            } else redirectWithStatus(res,BADREQUEST,'account','missing-fields');
        } else {
            res.status(BADREQUEST).json({ success: false, message: 'Invalid action' });
            return;
        }
    }
    static async handleEditSet(req: express.Request, res: express.Response): Promise<void> {}
    static async handleEditCard(req: express.Request, res: express.Response): Promise<void> {}

    //DELETE handlers
    static async handleDeleteSet(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = Object.assign(new Regular("", ""), req.session.user);
        const setID = parseInt(req.body.setID as string);
        console.log('deleting' + setID);
        const result = await user.deleteSet(setID);

        if(result === CardSetRemoveStatus.SUCCESS){
            redirectWithStatus(res,POSTOK,'','success');
        }
        else if(result === CardSetRemoveStatus.DATABASE_FAILURE){
            redirectWithStatus(res,POSTOK,'','error');
        }
        else if(result === CardSetRemoveStatus.SET_DOES_NOT_EXIST){
            redirectWithStatus(res,POSTOK,'','does-not-exist');
        }
    }
    static async handleDeleteCard(req: express.Request, res: express.Response): Promise<void> {}
    static async handleDeleteUser(req: express.Request, res: express.Response): Promise<void> {}
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
        await APIService.handleGetSets(req,res);
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
        await APIService.handleGetSet(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getSet', error: e});
    }
})

controller.get('/api/getSharedSets', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleGetSharedSets(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getSharedSets', error: e});
    }
})
controller.get('/api/getCardsInSet', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleGetCardsInSet(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})
controller.get('/api/getUserActivity',isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleGetUserActivity(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getUserActivity', error: e});
    }
})
controller.get('/api/getUsersActivity',isAuthenticated, isModeratorUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleGetUsersActivity(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getUserActivity', error: e});
    }
})
controller.get('/api/getRegulars', isAuthenticated, isModeratorUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleGetRegulars(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getRegulars', error: e});
    }
})
controller.get('/api/getModerators', isAuthenticated, isAdminUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleGetModerators(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//POST API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.post('/api/login', isNotAuthenticated, async (req, res) => {
    try{
        await APIService.handleLogin(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})
/**
 * Handles user registration requests
 * @param req - Express request object containing registration data
 * @param res - Express response object
 * @throws {Error} If registration process fails
 */
controller.post('/api/register', isNotAuthenticated , async (req, res) => {
    try{
        await APIService.handleRegister(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})
/**
 * Handles creation of new card sets
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If set creation fails
 */
controller.post('/api/newSet', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleNewSet(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'getCardsInSet', error: e});
    }
})
/**
 * Handles user logout
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If logout process fails
 */
controller.post('/api/logout', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{
        req.session.destroy(err =>{
            if(err) console.error(err); res.redirect('/login')
        });
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'logout', error: e});
    }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PUT API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.put('/api/editUser', async (req, res) => {
    try{
        await APIService.handleEditUser(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'editUser', error: e});
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handles deletion of card sets
 * @param req - Express request object containing set ID
 * @param res - Express response object
 * @throws {Error} If set deletion fails
 */
controller.delete('/api/deleteSet', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {
    try{
        await APIService.handleDeleteSet(req,res);
    } catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', {action: 'deleteSet', error: e});
    }
})
controller.delete('/api/deleteCard', isAuthenticated, isRegularUser, logUserActivity, async (req, res) => {

})
controller.delete('/api/deleteUser', isAuthenticated, isModeratorUser, logUserActivity, async (req, res) => {

})




/**
 * Renders the dashboard for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If fetching user data or card sets fails
 */
controller.get('/', isAuthenticated, logUserActivity, async (req, res) => {
    if(isRegular(req.session.user)){
        try {
            const cookie = getCookie(req); // gets authentication cookie
            const userSets = await axios.get('http://localhost:' + port + '/api/getSets', {
                headers: {
                    cookie
                }
            });
            const sharedSets = await axios.get('http://localhost:' + port + '/api/getSharedSets', {
                headers: {
                    cookie
                }
            });

            const user: Regular = Object.assign(new Regular("", ""), req.session.user);
            return res.render('regular_dashboard', {
                user: user,
                uID: await UserService.getIDOfUser(user),
                status: req.query.status,
                userSets: userSets.data,
                sharedSets: sharedSets.data,
                currentPage: 'dashboard'
            });
        } catch (e) {
            console.error(e);
            res.status(SERVERERROR).render('error', {action: 'GET /', error: e});
        }
    }
    else{
    }
});

/**
 * Renders the login page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/login', logUserActivity, (req, res) => {
    if (req.session.user) return res.redirect('/test');
    res.render('login', { status: req.query.status, currentPage: 'login' });
});

/**
 * Renders the registration page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/register', logUserActivity, (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('register', { status: req.query.status, currentPage: 'register' });
});

/**
 * Renders the account page for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/account', logUserActivity, (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('account', { account: req.session.user, status: req.query.status, currentPage: 'account' });
});

/**
 * Renders the view set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/view_set', logUserActivity, async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const cookie = getCookie(req);
        let setID;

        try {
            setID = req.query.setID;
        } catch (parseError) {
            console.error('Error parsing set JSON:', parseError);
            res.status(400).json({error: 'Invalid set data'});
            return;
        }

        const cards = await axios.get(`http://localhost:${port}/api/getCardsInSet`, {
            params: { setID },
            headers: { cookie }
        });

        const set = await axios.get(`http://localhost:${port}/api/getSet`, {
            params: { setID },
            headers: { cookie }
        });
        
        res.render("view_set", { set: set.data, cards: cards.data, status: req.query.status, currentPage: 'view_set' });
    } catch (error) {
        console.error('Error fetching set data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


/**
 * Renders the edit set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/edit_set', logUserActivity, async (req, res) => {
    if (!req.session.user) return res.redirect('/');

    try {
        const cookie = getCookie(req);
        let setID;

        try {
            setID = req.query.setID;
        } catch (parseError) {
            console.error('Error parsing set JSON:', parseError);
            res.status(400).json({error: 'Invalid set data'});
            return;
        }

        const cards = await axios.get(`http://localhost:${port}/api/getCardsInSet`, {
            params: { setID },
            headers: { cookie }
        });

        const set = await axios.get(`http://localhost:${port}/api/getSet`, {
            params: { setID },
            headers: { cookie }
        });
        
        res.render("edit_set", { set: set.data, cards: cards.data, status: req.query.status, currentPage: 'edit_set' });
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
        },
        status: req.query.status,
        currentPage: 'new_set'
    });
});

controller.get('/test', isAuthenticated, async (req, res) => {
    const baseURL = `${req.protocol}://${req.get('host')}/api`;

    // List of endpoints to test
    const endpoints = [
        { path: '/getSets', role: 'regular' },
        { path: '/getSet', role: 'regular', params: { setID: '40' } },
        { path: '/getSharedSets', role: 'regular' },
        { path: '/getCardsInSet', role: 'regular', params: { setID: '40' } },
        { path: '/getUserActivity', role: 'moderator', params: { time_period: 'alltime' }},
        { path: '/getUsersActivity', role: 'moderator', params: { time_period: 'alltime' }},
        { path: '/getRegulars', role: 'moderator' },
        { path: '/getModerators', role: 'admin' },
    ];

    const results: { [key: string]: any } = {};

    await Promise.all(
        endpoints.map(async endpoint => {
            const url = `${baseURL}${endpoint.path}`;
            try {
                const response = await axios.get(url, {
                    params: endpoint.params,
                    headers: {Cookie: req.headers.cookie || ''} // Pass user session cookies for authentication
                });
                results[endpoint.path] = {
                    status: response.status,
                    data: (Array.isArray(response.data) && response.data.length === 0) ? "Nothing Returned" : response.data
                };

            } catch (error) {
                if (axios.isAxiosError(error)) {
                    results[endpoint.path] = {
                        status: error.response?.status || 500, // Use actual status code if available
                        error: 'Request failed: ' + (error.response?.statusText || 'Unknown Error'),
                    };
                } else {
                    results[endpoint.path] = {
                        status: 500,
                        error: 'Request failed due to an unexpected error',
                    };
                }
            }
        })
    );

    res.render("test_results", { results , currentPage: 'test'});
});





/**
 * Handles 404 errors by serving the not found page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('*', (req, res) => res.status(404).sendFile(path.join(pub, "notfound.html")));

controller.listen(port, () => {console.log(`Server is running on port ${port}`);});

