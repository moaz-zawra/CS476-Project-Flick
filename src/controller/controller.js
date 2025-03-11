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
const utility_1 = require("../model/utility");
const user_service_1 = require("../model/user/user.service");
const cardset_model_1 = require("../model/cardSet/cardset.model");
const user_roles_1 = require("../model/user/user.roles");
const api_1 = require("../model/api");
exports.port = 3000;
const pub = path_1.default.join(__dirname, '../../public/');
const view = path_1.default.join(__dirname, '../../src/view');
const bundle = (0, utility_1.setupServer)(pub, view);
const activitySubject = bundle[0];
const controller = bundle[1];
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
controller.get('/api/getSets', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetSets(req, res);
})));
/**
 * Retrieves all cards within a specific set
 * @param req - Express request object containing set ID
 * @param res - Express response object containing cards
 * @throws {Error} If fetching cards fails
 */
controller.get('/api/getSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetSet(req, res);
})));
controller.get('/api/getSharedSets', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetSharedSets(req, res);
})));
controller.get('/api/getCardsInSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetCardsInSet(req, res);
})));
controller.get('/api/getUserActivity', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetUserActivity(req, res);
})));
controller.get('/api/getAllUsersActivity', utility_1.isAuthenticated, utility_1.isModeratorUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetUsersActivity(req, res);
})));
controller.get('/api/getRegulars', utility_1.isAuthenticated, utility_1.isModeratorUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetRegulars(req, res);
})));
controller.get('/api/getModerators', utility_1.isAuthenticated, utility_1.isAdminUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleGetModerators(req, res);
})));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//POST API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.post('/api/login', utility_1.isNotAuthenticated, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleLogin(req, res);
})));
/**
 * Handles user registration requests
 * @param req - Express request object containing registration data
 * @param res - Express response object
 * @throws {Error} If registration process fails
 */
controller.post('/api/register', utility_1.isNotAuthenticated, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleRegister(req, res);
})));
/**
 * Handles creation of new card sets
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If set creation fails
 */
controller.post('/api/newSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleNewSet(req, res);
})));
controller.post('/api/addCardToSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleNewCard(req, res);
})));
/**
 * Handles user logout
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If logout process fails
 */
controller.post('/api/logout', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.session.destroy(err => {
        if (err)
            console.error(err);
        res.redirect('/login');
    });
})));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PUT API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.put('/api/editUser', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleEditUser(req, res);
})));
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handles deletion of card sets
 * @param req - Express request object containing set ID
 * @param res - Express response object
 * @throws {Error} If set deletion fails
 */
controller.delete('/api/deleteSet', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield api_1.APIService.handleDeleteSet(req, res);
})));
controller.delete('/api/deleteCard', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
})));
controller.delete('/api/deleteUser', utility_1.isAuthenticated, utility_1.isModeratorUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
})));
/**
 * Renders the dashboard for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If fetching user data or card sets fails
 */
controller.get('/', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, utility_1.isRegular)(req.session.user)) {
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
            userSets: userSets.data.result,
            sharedSets: sharedSets.data.result,
            currentPage: 'dashboard'
        });
    }
})));
/**
 * Renders the login page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/login', utility_1.logUserActivity, (0, utility_1.routeHandler)((req, res) => {
    if (req.session.user)
        return res.redirect('/test');
    res.render('login', { status: req.query.status, currentPage: 'login' });
}));
/**
 * Renders the registration page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/register', utility_1.logUserActivity, (0, utility_1.routeHandler)((req, res) => {
    if (req.session.user)
        return res.redirect('/');
    res.render('register', { status: req.query.status, currentPage: 'register' });
}));
/**
 * Renders the account page for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/account', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.routeHandler)((req, res) => {
    res.render('account', { account: req.session.user, status: req.query.status, currentPage: 'account' });
}));
/**
 * Renders the view set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/view_set', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = (0, utility_1.getCookie)(req);
    let setID = req.query.setID;
    const cards = yield axios_1.default.get(`http://localhost:${exports.port}/api/getCardsInSet`, {
        params: { setID },
        headers: { cookie }
    });
    const set = yield axios_1.default.get(`http://localhost:${exports.port}/api/getSet`, {
        params: { setID },
        headers: { cookie }
    });
    res.render("view_set", { set: set.data.result, cards: cards.data.result, status: req.query.status, currentPage: 'view_set' });
})));
/**
 * Renders the edit set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/edit_set', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = (0, utility_1.getCookie)(req);
    let setID = req.query.setID;
    const cards = yield axios_1.default.get(`http://localhost:${exports.port}/api/getCardsInSet`, {
        params: { setID },
        headers: { cookie }
    });
    const set = yield axios_1.default.get(`http://localhost:${exports.port}/api/getSet`, {
        params: { setID },
        headers: { cookie }
    });
    res.render("edit_set", { set: set.data.result, cards: cards.data.result, status: req.query.status, currentPage: 'edit_set' });
})));
/**
 * Renders the new set creation page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/new_set', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.routeHandler)((req, res) => {
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
}));
controller.get('/test', utility_1.isAuthenticated, utility_1.isRegularUser, utility_1.logUserActivity, (0, utility_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const baseURL = `${req.protocol}://${req.get('host')}/api`;
    // Fetch all sets first to get a valid setID
    const userSets = yield axios_1.default.get('http://localhost:' + exports.port + '/api/getSets', {
        headers: {
            cookie: req.headers.cookie || ''
        }
    });
    console.log(userSets.data.result);
    let setID = userSets.data.result.length > 0 ? userSets.data.result[0].setID : null;
    // List of endpoints to test
    const endpoints = [
        { path: '/getSets', role: 'regular' },
        { path: '/getSet', role: 'regular', params: { setID } },
        { path: '/getSharedSets', role: 'regular' },
        { path: '/getCardsInSet', role: 'regular', params: { setID } },
        { path: '/getUserActivity', role: 'moderator', params: { time_period: 'alltime' } },
        { path: '/getAllUsersActivity', role: 'moderator', params: { time_period: 'alltime' } },
        { path: '/getRegulars', role: 'moderator' },
        { path: '/getModerators', role: 'admin' },
    ];
    const results = {};
    yield Promise.all(endpoints.map((endpoint) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const url = `${baseURL}${endpoint.path}`;
        try {
            const response = yield axios_1.default.get(url, {
                params: endpoint.params,
                headers: { Cookie: req.headers.cookie || '' } // Pass user session cookies for authentication
            });
            results[endpoint.path] = {
                status: response.status,
                data: (Array.isArray(response.data.results) && response.data.results.length === 0) ? "Nothing Returned" : response.data
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                results[endpoint.path] = {
                    status: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500, // Use actual status code if available
                    error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 403 ? 'Your account is not authorized to test this route' : 'Request failed: ' + (((_c = error.response) === null || _c === void 0 ? void 0 : _c.statusText) || 'Unknown Error'),
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
})));
/**
 * Handles 404 errors by serving the not found page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('*', (0, utility_1.routeHandler)((req, res) => {
    res.status(404).sendFile(path_1.default.join(pub, "notfound.html"));
}));
controller.listen(exports.port, () => { console.log(`Server is running on port ${exports.port}`); });
