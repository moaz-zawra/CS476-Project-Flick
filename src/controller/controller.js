"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = void 0;
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const method_override_1 = __importDefault(require("method-override"));
const utility_1 = require("../model/utility");
const user_service_1 = require("../model/user/user.service");
const user_types_1 = require("../model/user/user.types");
const cardset_model_1 = require("../model/cardSet/cardset.model");
const user_roles_1 = require("../model/user/user.roles");
const cardset_types_1 = require("../model/cardSet/cardset.types");
const card_types_1 = require("../model/card/card.types");
const user_auth_1 = require("../model/user/user.auth");
const card_model_1 = require("../model/card/card.model");
const pub = path_1.default.join(__dirname, '../../public/');
const view = path_1.default.join(__dirname, '../../src/view');
const GETOK = 200;
const POSTOK = 201;
const BADREQUEST = 400;
const NOTAUTH = 401;
const FORBIDDEN = 403;
const NOTFOUND = 404;
const SERVERERROR = 500;
const CONFLICT = 409;
exports.port = 3000;
const controller = (0, utility_1.setupExpress)(pub, view);
controller.use((0, method_override_1.default)('_method'));
/**
 * Helper function to handle redirection based on status.
 *
 * @param res - The Express response object.
 * @param response_code
 * @param route
 * @param status - The registration status to be included in the query string.
 */
function redirectWithStatus(res, response_code, route, status) {
    res.status(response_code).redirect(`/${route}?status=${status}`);
}
class APIService {
    //All of these functions assume req.session.user has already been authenticated in the route beforehand
    //GET handlers
    static handleGetSets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const result = yield user.getAllSets();
            if (result === cardset_types_1.CardSetGetStatus.DATABASE_FAILURE) {
                res.status(SERVERERROR).render('error', { action: 'APIService.handleGetSets()', error: 'Database Error' });
            }
            if (result === cardset_types_1.CardSetGetStatus.USER_HAS_NO_SETS) {
                res.status(GETOK).json([]);
            }
            else
                res.status(GETOK).json(result);
        });
    }
    static handleGetSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const setID = parseInt(req.query.setID);
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const result = yield user.getSet(setID);
            if (result === cardset_types_1.CardSetGetStatus.DATABASE_FAILURE) {
                res.status(SERVERERROR).render('error', { action: 'APIService.handleGetSet()', error: 'Database Error' });
            }
            if (result === cardset_types_1.CardSetGetStatus.SET_DOES_NOT_EXIST) {
                res.status(NOTFOUND).render('error', { action: 'APIService.handleGetSet()', error: 'Requested set does not exist in DB' });
            }
            else
                res.status(GETOK).json(result);
        });
    }
    static handleGetCardsInSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const setID = parseInt(req.query.setID);
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const result = yield user.getCards(setID);
            if (result === card_types_1.CardGetStatus.DATABASE_FAILURE) {
                res.status(SERVERERROR).render('error', { action: 'APIService.handleGetCardsInSet()', error: 'Database Error' });
            }
            else if (result === card_types_1.CardGetStatus.SET_DOES_NOT_EXIST) {
                res.status(NOTFOUND).render('error', { action: 'APIService.handleGetCardsInSet()', error: 'Requested set does not exist in DB' });
            }
            else if (result === card_types_1.CardGetStatus.SET_HAS_NO_CARDS) {
                res.status(GETOK).json([]);
            }
            else
                res.status(GETOK).json(result);
        });
    }
    static handleGetSharedSets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const result = yield user.getSharedSets();
            if (result === cardset_types_1.CardSetGetStatus.DATABASE_FAILURE) {
                res.status(SERVERERROR).render('error', { action: 'APIService.handleGetSharedSets()', error: 'Database Error' });
            }
            if (result === cardset_types_1.CardSetGetStatus.USER_HAS_NO_SETS) {
                res.status(GETOK).json([]);
            }
            else
                res.status(GETOK).json(result);
        });
    }
    static handleGetUserActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const time_period = req.query.time_period;
            if (time_period === "alltime") {
                const result = yield user.getAllTimeActivity();
                if (result) {
                    res.status(GETOK).json(result);
                }
                else
                    res.status(NOTFOUND).json([]);
            }
            else {
                const result = yield user.getWeeklyActivity();
                if (result) {
                    res.status(GETOK).json(result);
                }
                else
                    res.status(NOTFOUND).json([]);
            }
        });
    }
    static handleGetUsersActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Moderator("", ""), req.session.user);
            const time_period = req.query.time_period;
            if (time_period === "alltime") {
                const result = yield user.getUsersAllTimeActivity();
                if (result) {
                    res.status(GETOK).json(result);
                    return;
                }
                else
                    res.status(NOTFOUND).json([]);
            }
            else {
                const result = yield user.getUsersWeeklyActivity();
                if (result) {
                    res.status(GETOK).json(result);
                    return;
                }
                else
                    res.status(NOTFOUND).json([""]);
            }
        });
    }
    static handleGetRegulars(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Moderator("", ""), req.session.user);
            const result = yield user.getRegularUsers();
            if (result) {
                res.status(GETOK).json(result);
                return;
            }
            res.status(NOTFOUND).json([""]);
        });
    }
    static handleGetModerators(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Administrator("", ""), req.session.user);
            const result = yield user.getModeratorUsers();
            if (result) {
                res.status(GETOK).json(result);
                return;
            }
            res.status(NOTFOUND).json([""]);
        });
    }
    //POST handlers
    static handleLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield new user_auth_1.UserCreator().login(req.body.identifier, req.body.password);
            if (user === user_types_1.LoginStatus.USER_DOES_NOT_EXIST) {
                redirectWithStatus(res, NOTFOUND, 'login', 'does-not-exist');
            }
            else if (user === user_types_1.LoginStatus.WRONG_PASSWORD) {
                redirectWithStatus(res, NOTAUTH, 'login', 'wrong-password');
            }
            else if (user === user_types_1.LoginStatus.OTHER || user === user_types_1.LoginStatus.DATABASE_FAILURE) {
                redirectWithStatus(res, SERVERERROR, 'login', 'error');
            }
            else {
                req.session.user = user;
                res.redirect('/');
            }
        });
    }
    static handleRegister(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password, cpassword } = req.body;
            if (username && email && password && cpassword) {
                const result = yield new user_auth_1.UserCreator().registerUser(username, email, password, cpassword);
                if (result === user_types_1.RegisterStatus.SUCCESS) {
                    redirectWithStatus(res, POSTOK, 'login', 'registration-success');
                }
                else if (result === user_types_1.RegisterStatus.USERNAME_USED) {
                    redirectWithStatus(res, CONFLICT, 'register', 'username-used');
                }
                else if (result === user_types_1.RegisterStatus.EMAIL_USED) {
                    redirectWithStatus(res, CONFLICT, 'register', 'email-used');
                }
                else if (result === user_types_1.RegisterStatus.BAD_PASSWORD) {
                    redirectWithStatus(res, BADREQUEST, 'register', 'bad-password');
                }
                else if (result === user_types_1.RegisterStatus.PASSWORD_MISMATCH) {
                    redirectWithStatus(res, BADREQUEST, 'register', 'mismatch-password');
                }
                else if (result === user_types_1.RegisterStatus.DATABASE_FAILURE) {
                    redirectWithStatus(res, SERVERERROR, 'register', 'error');
                }
            }
            else
                redirectWithStatus(res, BADREQUEST, 'register', 'missing-fields');
        });
    }
    static handleNewSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const uID = yield user_service_1.UserService.getIDOfUser(user);
            const { setName, category, subcategory, setDesc } = req.body;
            if (setName && category && subcategory && setDesc) {
                const set = (0, cardset_model_1.makeCardSet)(uID, setName, category, subcategory, setDesc);
                const result = yield user.addSet(set);
                if (result === cardset_types_1.CardSetAddStatus.SUCCESS) {
                    user_service_1.UserService.logUserAction(user, user_types_1.UserAction.NEWSET);
                    redirectWithStatus(res, POSTOK, '', 'success');
                }
                else if (result === cardset_types_1.CardSetAddStatus.MISSING_INFORMATION) {
                    redirectWithStatus(res, BADREQUEST, '', 'missing-fields');
                }
                else if (result === cardset_types_1.CardSetAddStatus.NAME_USED) {
                    redirectWithStatus(res, CONFLICT, '', 'name-used');
                }
                else if (result === cardset_types_1.CardSetAddStatus.DATABASE_FAILURE) {
                    redirectWithStatus(res, SERVERERROR, '', 'error');
                }
            }
            else
                redirectWithStatus(res, BADREQUEST, '', 'missing-fields');
        });
    }
    static handleNewCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const { front_text, back_text, setID } = req.body;
            if (front_text && back_text && setID) {
                user_service_1.UserService.logUserAction(user, user_types_1.UserAction.NEWCARD);
                const card = (0, card_model_1.makeCard)(setID, front_text, back_text);
                const result = yield user.addCardToSet(card);
                if (result === card_types_1.CardAddStatus.SUCCESS) {
                    return res.status(BADREQUEST).redirect('/edit_set?setID=' + setID + '&status=success');
                }
                else if (result === card_types_1.CardAddStatus.MISSING_INFORMATION) {
                    return res.status(BADREQUEST).redirect('/edit_set?setID=' + setID + '&status=missing-fields');
                }
                else if (result === card_types_1.CardAddStatus.SET_DOES_NOT_EXIST) {
                    return res.status(NOTFOUND).redirect('/edit_set?setID=' + setID + '&status=set-does-not-exist');
                }
                else if (result === card_types_1.CardAddStatus.DATABASE_FAILURE) {
                    return res.status(SERVERERROR).redirect('/edit_set?setID=' + setID + '&status=error');
                }
            }
            else {
                return res.status(BADREQUEST).redirect('/edit_set?setID=' + setID + '&status=missing-fields');
            }
        });
    }
    static handleBan(req, res) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    static handleUnBan(req, res) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //PUT handlers
    static handleEditUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = req.body.action;
            if (action === 'change_details') {
                const { username, email, oldUsername, oldEmail } = req.body;
                if (username && email && oldUsername && oldEmail) {
                    if (username === oldUsername && email === oldEmail) {
                        redirectWithStatus(res, POSTOK, 'account', '');
                    }
                    else {
                        const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
                        const result = yield user.changeDetails(username, email);
                        if (result === user_types_1.UserChangeStatus.SUCCESS) {
                            req.session.user = Object.assign(req.session.user, { username, email });
                            redirectWithStatus(res, POSTOK, 'account', 'success');
                        }
                        else if (result === user_types_1.UserChangeStatus.USER_DOES_NOT_EXIST) {
                            redirectWithStatus(res, BADREQUEST, 'account', 'user-does-not-exist');
                        }
                        else if (result === user_types_1.UserChangeStatus.DATABASE_FAILURE) {
                            redirectWithStatus(res, SERVERERROR, 'account', 'error');
                        }
                        else if (result === user_types_1.UserChangeStatus.INCORRECT_PASSWORD) {
                            redirectWithStatus(res, NOTAUTH, 'account', 'incorrect-password');
                        }
                    }
                }
                else
                    redirectWithStatus(res, BADREQUEST, 'account', 'missing-fields');
            }
            else if (action === 'change_password') {
                const { current_password, new_password } = req.body;
                if (current_password && new_password) {
                    const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
                    const result = yield user.changePassword(current_password, new_password);
                    if (result === user_types_1.UserChangeStatus.SUCCESS) {
                        redirectWithStatus(res, POSTOK, 'account', 'success');
                    }
                    else if (result === user_types_1.UserChangeStatus.USER_DOES_NOT_EXIST) {
                        redirectWithStatus(res, BADREQUEST, 'account', 'user-does-not-exist');
                    }
                    else if (result === user_types_1.UserChangeStatus.DATABASE_FAILURE) {
                        redirectWithStatus(res, SERVERERROR, 'account', 'error');
                    }
                    else if (result === user_types_1.UserChangeStatus.INCORRECT_PASSWORD) {
                        redirectWithStatus(res, NOTAUTH, 'account', 'incorrect-password');
                    }
                }
                else
                    redirectWithStatus(res, BADREQUEST, 'account', 'missing-fields');
            }
            else {
                res.status(BADREQUEST).json({ success: false, message: 'Invalid action' });
                return;
            }
        });
    }
    static handleEditSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    static handleEditCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    //DELETE handlers
    static handleDeleteSet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            const setID = parseInt(req.body.setID);
            console.log('deleting' + setID);
            const result = yield user.deleteSet(setID);
            if (result === cardset_types_1.CardSetRemoveStatus.SUCCESS) {
                redirectWithStatus(res, POSTOK, '', 'success');
            }
            else if (result === cardset_types_1.CardSetRemoveStatus.DATABASE_FAILURE) {
                redirectWithStatus(res, POSTOK, '', 'error');
            }
            else if (result === cardset_types_1.CardSetRemoveStatus.SET_DOES_NOT_EXIST) {
                redirectWithStatus(res, POSTOK, '', 'does-not-exist');
            }
        });
    }
    static handleDeleteCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    static handleDeleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () { });
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
controller.get('/api/getSets', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetSets(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getSets', error: e });
    }
}));
/**
 * Retrieves all cards within a specific set
 * @param req - Express request object containing set ID
 * @param res - Express response object containing cards
 * @throws {Error} If fetching cards fails
 */
controller.get('/api/getSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetSet(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getSet', error: e });
    }
}));
controller.get('/api/getSharedSets', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetSharedSets(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getSharedSets', error: e });
    }
}));
controller.get('/api/getCardsInSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetCardsInSet(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getCardsInSet', error: e });
    }
}));
controller.get('/api/getUserActivity', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetUserActivity(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getUserActivity', error: e });
    }
}));
controller.get('/api/getUsersActivity', utility_1.isAuthenticated, utility_1.isModeratorUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetUsersActivity(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getUserActivity', error: e });
    }
}));
controller.get('/api/getRegulars', utility_1.isAuthenticated, utility_1.isModeratorUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetRegulars(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getRegulars', error: e });
    }
}));
controller.get('/api/getModerators', utility_1.isAuthenticated, utility_1.isAdminUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleGetModerators(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getCardsInSet', error: e });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//POST API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.post('/api/login', utility_1.isNotAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleLogin(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getCardsInSet', error: e });
    }
}));
/**
 * Handles user registration requests
 * @param req - Express request object containing registration data
 * @param res - Express response object
 * @throws {Error} If registration process fails
 */
controller.post('/api/register', utility_1.isNotAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleRegister(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getCardsInSet', error: e });
    }
}));
/**
 * Handles creation of new card sets
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If set creation fails
 */
controller.post('/api/newSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleNewSet(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'getCardsInSet', error: e });
    }
}));
controller.post('/api/addCardToSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleNewCard(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'addCardToSet', error: e });
    }
}));
/**
 * Handles user logout
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If logout process fails
 */
controller.post('/api/logout', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy(err => {
            if (err)
                console.error(err);
            res.redirect('/login');
        });
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'logout', error: e });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PUT API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.put('/api/editUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleEditUser(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'editUser', error: e });
    }
}));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handles deletion of card sets
 * @param req - Express request object containing set ID
 * @param res - Express response object
 * @throws {Error} If set deletion fails
 */
controller.delete('/api/deleteSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield APIService.handleDeleteSet(req, res);
    }
    catch (e) {
        console.error(e);
        res.status(SERVERERROR).render('error', { action: 'deleteSet', error: e });
    }
}));
controller.delete('/api/deleteCard', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
controller.delete('/api/deleteUser', utility_1.isAuthenticated, utility_1.isModeratorUser, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
/**
 * Renders the dashboard for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If fetching user data or card sets fails
 */
controller.get('/', utility_1.isAuthenticated, utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, utility_1.isRegular)(req.session.user)) {
        try {
            const cookie = (0, utility_1.getCookie)(req); // gets authentication cookie
            const userSets = yield axios_1.default.get('http://localhost:' + exports.port + '/api/getSets', {
                headers: {
                    cookie
                }
            });
            const sharedSets = yield axios_1.default.get('http://localhost:' + exports.port + '/api/getSharedSets', {
                headers: {
                    cookie
                }
            });
            const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
            return res.render('regular_dashboard', {
                user: user,
                uID: yield user_service_1.UserService.getIDOfUser(user),
                status: req.query.status,
                userSets: userSets.data,
                sharedSets: sharedSets.data,
                currentPage: 'dashboard'
            });
        }
        catch (e) {
            console.error(e);
            res.status(SERVERERROR).render('error', { action: 'GET /', error: e });
        }
    }
    else {
    }
}));
/**
 * Renders the login page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/login', utility_1.logUserActivity, (req, res) => {
    if (req.session.user)
        return res.redirect('/test');
    res.render('login', { status: req.query.status, currentPage: 'login' });
});
/**
 * Renders the registration page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/register', utility_1.logUserActivity, (req, res) => {
    if (req.session.user)
        return res.redirect('/');
    res.render('register', { status: req.query.status, currentPage: 'register' });
});
/**
 * Renders the account page for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/account', utility_1.logUserActivity, (req, res) => {
    if (!req.session.user)
        return res.redirect('/login');
    res.render('account', { account: req.session.user, status: req.query.status, currentPage: 'account' });
});
/**
 * Renders the view set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/view_set', utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user)
        return res.redirect('/');
    try {
        const cookie = (0, utility_1.getCookie)(req);
        let setID;
        try {
            setID = req.query.setID;
        }
        catch (parseError) {
            console.error('Error parsing set JSON:', parseError);
            res.status(400).json({ error: 'Invalid set data' });
            return;
        }
        const cards = yield axios_1.default.get(`http://localhost:${exports.port}/api/getCardsInSet`, {
            params: { setID },
            headers: { cookie }
        });
        const set = yield axios_1.default.get(`http://localhost:${exports.port}/api/getSet`, {
            params: { setID },
            headers: { cookie }
        });
        res.render("view_set", { set: set.data, cards: cards.data, status: req.query.status, currentPage: 'view_set' });
    }
    catch (error) {
        console.error('Error fetching set data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
/**
 * Renders the edit set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/edit_set', utility_1.logUserActivity, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user)
        return res.redirect('/');
    try {
        const cookie = (0, utility_1.getCookie)(req);
        let setID;
        try {
            setID = req.query.setID;
        }
        catch (parseError) {
            console.error('Error parsing set JSON:', parseError);
            res.status(400).json({ error: 'Invalid set data' });
            return;
        }
        const cards = yield axios_1.default.get(`http://localhost:${exports.port}/api/getCardsInSet`, {
            params: { setID },
            headers: { cookie }
        });
        const set = yield axios_1.default.get(`http://localhost:${exports.port}/api/getSet`, {
            params: { setID },
            headers: { cookie }
        });
        res.render("edit_set", { set: set.data, cards: cards.data, status: req.query.status, currentPage: 'edit_set' });
    }
    catch (error) {
        console.error('Error fetching set data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
/**
 * Renders the new set creation page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/new_set', (req, res) => {
    if (!req.session.user)
        return res.redirect('/');
    // Create a mapping of category names
    const categoryNames = {
        [cardset_model_1.Category.Language]: 'Language',
        [cardset_model_1.Category.Technology]: 'Technology',
        [cardset_model_1.Category.CourseSubjects]: 'Course Subjects',
        [cardset_model_1.Category.Law]: 'Law',
        [cardset_model_1.Category.Medical]: 'Medical',
        [cardset_model_1.Category.Military]: 'Military'
    };
    res.render("new_set", {
        categories: cardset_model_1.Category,
        categoryNames,
        subcategories: {
            [cardset_model_1.Category.Language]: cardset_model_1.SubCategory_Language,
            [cardset_model_1.Category.Technology]: cardset_model_1.SubCategory_Technology,
            [cardset_model_1.Category.CourseSubjects]: cardset_model_1.SubCategory_CourseSubjects,
            [cardset_model_1.Category.Law]: cardset_model_1.SubCategory_Law,
            [cardset_model_1.Category.Medical]: cardset_model_1.SubCategory_Medical,
            [cardset_model_1.Category.Military]: cardset_model_1.SubCategory_Military
        },
        status: req.query.status,
        currentPage: 'new_set'
    });
});
controller.get('/test', utility_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const baseURL = `${req.protocol}://${req.get('host')}/api`;
    // List of endpoints to test
    const endpoints = [
        { path: '/getSets', role: 'regular' },
        { path: '/getSet', role: 'regular', params: { setID: '40' } },
        { path: '/getSharedSets', role: 'regular' },
        { path: '/getCardsInSet', role: 'regular', params: { setID: '40' } },
        { path: '/getUserActivity', role: 'moderator', params: { time_period: 'alltime' } },
        { path: '/getUsersActivity', role: 'moderator', params: { time_period: 'alltime' } },
        { path: '/getRegulars', role: 'moderator' },
        { path: '/getModerators', role: 'admin' },
    ];
    const results = {};
    yield Promise.all(endpoints.map((endpoint) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const url = `${baseURL}${endpoint.path}`;
        try {
            const response = yield axios_1.default.get(url, {
                params: endpoint.params,
                headers: { Cookie: req.headers.cookie || '' } // Pass user session cookies for authentication
            });
            results[endpoint.path] = {
                status: response.status,
                data: (Array.isArray(response.data) && response.data.length === 0) ? "Nothing Returned" : response.data
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                results[endpoint.path] = {
                    status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500, // Use actual status code if available
                    error: 'Request failed: ' + (((_b = error.response) === null || _b === void 0 ? void 0 : _b.statusText) || 'Unknown Error'),
                };
            }
            else {
                results[endpoint.path] = {
                    status: 500,
                    error: 'Request failed due to an unexpected error',
                };
            }
        }
    })));
    res.render("test_results", { results, currentPage: 'test' });
}));
/**
 * Handles 404 errors by serving the not found page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('*', (req, res) => res.status(404).sendFile(path_1.default.join(pub, "notfound.html")));
controller.listen(exports.port, () => { console.log(`Server is running on port ${exports.port}`); });
