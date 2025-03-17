import path from 'path';
import axios from 'axios';

import {
    asyncHandler,
    createUserFromSession,
    getCookie,
    isAdmin,
    isAdminUser,
    isAuthenticated,
    isModerator,
    isModeratorUser,
    isNotAuthenticated,
    isRegular,
    isRegularUser,
    isSetOwner,
    logUserActivity,
    routeHandler,
    setupServer,
} from "../model/utility";
import {UserService} from "../model/user/user.service";
import {
    Category,
    SubCategory_CourseSubjects,
    SubCategory_Language,
    SubCategory_Law,
    SubCategory_Medical,
    SubCategory_Military,
    SubCategory_Technology
} from '../model/cardSet/cardset.model';
import {Administrator, Moderator, Regular} from "../model/user/user.roles";
import { APIService, GETOK, handleTemplateResponse } from '../model/api';

const categoryNames = Object.keys(Category)
    .filter(key => !isNaN(Number(key)))
    .reduce((acc: { [key: string]: string }, key: string) => {
        if (Category[key as any] === "CourseSubjects") {
            acc[key] = "Course Subjects";
        } else {
            acc[key] = Category[key as any];
        }
        return acc;
    }, {});
export const port = 3000;

const pub = path.join(__dirname, '../../public/');
const view = path.join(__dirname, '../../src/view');

let bundle;
try {
    bundle = setupServer(pub, view);
} catch (error) {
    console.error('Failed to set up server:', error);
    process.exit(1);
}


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
controller.get('/api/getSets', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const setType = req.query.set_type as string || '';
        await APIService.handleGetSets(req, res, setType);
    })
);
/**
 * Retrieves all cards within a specific set
 * @param req - Express request object containing set ID
 * @param res - Express response object containing cards
 * @throws {Error} If fetching cards fails
 */
controller.get('/api/getSet', 
    isAuthenticated,
    isSetOwner,
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const setType = req.query.set_type as string || '';
        await APIService.handleGetSet(req, res, setType);
    })
);

controller.get('/api/getReportedSets',
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleGetReportedSets(req, res);
    })
);
controller.get('/api/getUnapprovedSets',
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleGetUnapprovedSets(req, res);
    })
);
controller.get('/api/getCardsInSet', 
    isAuthenticated,
    isSetOwner,
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
      await APIService.handleGetCardsInSet(req, res);
    })
);

controller.get('/api/getUserActivity', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
      await APIService.handleGetUserActivity(req, res);
    })
);
controller.get('/api/getAllUsersActivity',
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleGetUsersActivity(req, res);
    })
);

controller.get('/api/getRegulars', 
    isAuthenticated, 
    isModeratorUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
      await APIService.handleGetRegulars(req, res);
    })
);

controller.get('/api/getModerators', 
    isAuthenticated, 
    isAdminUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
      await APIService.handleGetModerators(req, res);
    })
);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//POST API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.post('/api/login', 
    isNotAuthenticated, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleLogin(req, res);
    })
);

/**
 * Handles user registration requests
 * @param req - Express request object containing registration data
 * @param res - Express response object
 * @throws {Error} If registration process fails
 */
controller.post('/api/register', 
    isNotAuthenticated, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleRegister(req, res);
    })
);

/**
 * Handles creation of new card sets
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If set creation fails
 */
controller.post('/api/newSet', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleNewSet(req, res);
    })
);

controller.post('/api/addCardToSet', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity,
    isSetOwner,
    asyncHandler(async (req, res) => {
        await APIService.handleNewCard(req, res);
    })
);

controller.post('/api/shareSet', 
    isAuthenticated, 
    isRegularUser, 
    isSetOwner,
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleShareSet(req, res);
    })
);

/**
 * Handles user logout
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If logout process fails
 */
controller.post('/api/logout', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        req.session.destroy(err => {
            if(err) {
                console.error(err);
                return res.status(500).send('Logout failed');
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/login');
        });
    })
);

controller.post('/api/reportSet', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleReportSet(req, res);
    })
);

controller.post('/api/dismissReport', 
    isAuthenticated, 
    isModeratorUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleDismissReport(req, res);
    })
);


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PUT API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
controller.put('/api/editUser', 
    isAuthenticated,
    isRegularUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleEditUser(req, res);
    })
);

controller.put('/api/incrementSetViews',
    isAuthenticated,
    isRegularUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleIncrementSetViews(req, res);
    })
);

controller.put('/api/editSet', 
    isAuthenticated,
    isRegularUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleEditSet(req, res);
    })
);

controller.put('/api/editCard', 
    isAuthenticated,
    isRegularUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleEditCard(req, res);
    })
);

controller.put('/api/adminEditUser', 
    isAuthenticated,
    isAdminUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        //await APIService.handleAdminEditUser(req, res);
    })
);

controller.put('/api/promoteRegular', 
    isAuthenticated,
    isAdminUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        //await APIService.handlePromotion(req, res);
    })
);

controller.put('/api/demoteModerator', 
    isAuthenticated,
    isAdminUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        //await APIService.handleDemotion(req, res);
    })
);

controller.put('/api/banUser', 
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleBan(req, res);
    })
);

controller.put('/api/unbanUser', 
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.handleUnBan(req, res);
    })
);

controller.put('/api/approveSet', 
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.approveSet(req, res);
    })
);

controller.put('/api/disapproveSet', 
    isAuthenticated,
    isModeratorUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        await APIService.disapproveSet(req, res);
    })
);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETE API routes
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handles deletion of card sets
 * @param req - Express request object containing set ID
 * @param res - Express response object
 * @throws {Error} If set deletion fails
 */
controller.delete('/api/deleteSet', 
    isAuthenticated, 
    isRegularUser, 
    isSetOwner,
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleDeleteSet(req, res);
    })
);

controller.delete('/api/deleteCard', 
    isAuthenticated, 
    isRegularUser, 
    isSetOwner,
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleDeleteCard(req, res);
    })
);

controller.delete('/api/deleteUser', 
    isAuthenticated, 
    isModeratorUser,
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const userID = Number(req.query.userID || req.body.userID);
        
        if (!userID) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        await APIService.handleDeleteUser(req, res);
    })
);

controller.delete('/api/removeSharedSet', 
    isAuthenticated, 
    isRegularUser, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        await APIService.handleRemoveSharedSet(req, res);
    })
);


/**
 * Renders the dashboard for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 * @throws {Error} If fetching user data or card sets fails
 */
controller.get('/',
    isAuthenticated, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const cookie = getCookie(req); // gets authentication cookie
        if(isRegular(req.session.user)){
            // Get data required for regular user dashboard
            const userSets = await axios.get('http://localhost:' + port + '/api/getSets', {
                headers: {
                    cookie
                },
                params: {set_type: 'user'}
            });
            const sharedSets = await axios.get('http://localhost:' + port + '/api/getSets', {
                headers: {
                    cookie
                },
                params: {set_type: 'shared'}
            });
        
            // Add owner info to each shared set object
            sharedSets.data.result = await Promise.all(
                sharedSets.data.result.map(async (set: any) => {
                    const owner = await UserService.getUserByIdentifier(set.ownerID);
                    set.ownerID = {username: owner?.username || '', email: owner?.email || ''};
                    return set;
                })
            );

            if(isModerator(req.session.user)){
                //Get data required for moderator dashboard
                const users = await axios.get('http://localhost:' + port + '/api/getRegulars', {
                    headers: {
                        cookie
                    }
                });
                const usersAllTimeActivity = await axios.get('http://localhost:' + port + '/api/getAllUsersActivity', {
                    headers: {
                        cookie
                    }, params: { time_period: 'alltime' }
                });
                const usersWeeklyActivity = await axios.get('http://localhost:' + port + '/api/getAllUsersActivity', {
                    headers: {
                        cookie
                    }, params: { time_period: '7days' }
                });
                const reportedSets = await axios.get('http://localhost:' + port + '/api/getReportedSets', {
                    headers: {
                        cookie
                    }
                });
                // append username to each reported set
                reportedSets.data.result = await Promise.all(
                    reportedSets.data.result.map(async (set: any) => {
                        const user = await UserService.getUserByIdentifier(set.reporterID);
                        set.reporterUsername = user?.username || '';
                        return set;
                    })
                );
                const unapprovedSets = await axios.get('http://localhost:' + port + '/api/getUnapprovedSets', {
                    headers: {
                        cookie
                    }
                });
                // append username to each unapproved set
                unapprovedSets.data.result = await Promise.all(
                    unapprovedSets.data.result.map(async (set: any) => {
                        const user = await UserService.getUserByIdentifier(set.ownerID);
                        set.ownerID = user?.username || '';
                        return set;
                    })
                );
          
                if(isAdmin(req.session.user)){

                } else {
                    handleTemplateResponse(res,GETOK,'dashboard', {
                        role: 'moderator',
                        user: createUserFromSession(req, Moderator),
                        uID: await UserService.getIDOfUser(req.session.user.username),
                        status: req.query.status,
                        userSets: userSets.data.result,
                        sharedSets: sharedSets.data.result,
                        users: users.data.result,
                        reportedSets: reportedSets.data.result,
                        usersAlltimeActivity: usersAllTimeActivity.data.result,
                        usersWeeklyActivity: usersWeeklyActivity.data.result,
                        categoryNames,
                        unapprovedSets: unapprovedSets.data.result,
                        subcategories: {
                            [Category.Language]: SubCategory_Language,
                            [Category.Technology]: SubCategory_Technology,
                            [Category.CourseSubjects]: SubCategory_CourseSubjects,
                            [Category.Law]: SubCategory_Law,
                            [Category.Medical]: SubCategory_Medical,
                            [Category.Military]: SubCategory_Military
                        },
                        currentPage: 'dashboard'
                    });
                }
            } else {
                handleTemplateResponse(res,GETOK,'dashboard', {
                    role: 'regular',
                    user: createUserFromSession(req, Regular),
                    uID: await UserService.getIDOfUser(req.session.user.username),
                    status: req.query.status,
                    userSets: userSets.data.result,
                    sharedSets: sharedSets.data.result,
                    categoryNames,
                    subcategories: {
                        [Category.Language]: SubCategory_Language,
                        [Category.Technology]: SubCategory_Technology,
                        [Category.CourseSubjects]: SubCategory_CourseSubjects,
                        [Category.Law]: SubCategory_Law,
                        [Category.Medical]: SubCategory_Medical,
                        [Category.Military]: SubCategory_Military
                    },
                    currentPage: 'dashboard'
                });
            }
        }
    })
);


controller.get('/play_set',
    isAuthenticated, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const cookie = getCookie(req); // gets authentication cookie
        let setID = req.query.setID;
        let setType = req.query.set_type || 'user';
        const cards = await axios.get(`http://localhost:${port}/api/getCardsInSet`, {
            params: { setID, setType },
            headers: { cookie }
        });
        const set = await axios.get(`http://localhost:${port}/api/getSet`, {
            params: { setID, set_type: setType },
            headers: { cookie }
        });
        //add owner info to set object
        const owner = await UserService.getUserByIdentifier(set.data.result.ownerID);
        set.data.result.ownerID = {username: owner?.username || '', email: owner?.email || ''};
        res.render("play_set", {
            set: set.data.result,
            cards: cards.data.result,
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
            currentPage: 'play_set'
        });
    })
);

controller.get('/public_sets',
    isAuthenticated, 
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const cookie = getCookie(req); // gets authentication cookie
        const publicSets = await axios.get('http://localhost:' + port + '/api/getSets', {
            headers: {
                cookie
            },
            params: {set_type: 'public'}
        });
        // Add owner info to each public set object
        publicSets.data.result = await Promise.all(
            publicSets.data.result.map(async (set: any) => {
                const owner = await UserService.getUserByIdentifier(set.ownerID);
                set.ownerID = {username: owner?.username || '', email: owner?.email || ''};
                return set;
            })
        );

        handleTemplateResponse(res,GETOK,'public_sets', {
            role: 'regular',
            user: createUserFromSession(req, Regular),
            uID: await UserService.getIDOfUser(req.session.user.username),
            status: req.query.status,
            publicSets: publicSets.data.result,
            categoryNames,
            subcategories: {
                [Category.Language]: SubCategory_Language,
                [Category.Technology]: SubCategory_Technology,
                [Category.CourseSubjects]: SubCategory_CourseSubjects,
                [Category.Law]: SubCategory_Law,
                [Category.Medical]: SubCategory_Medical,
                [Category.Military]: SubCategory_Military
            },
            currentPage: 'public_sets'
        });
    })
);

/**
 * Renders the login page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/login',
    isNotAuthenticated,
    logUserActivity, 
    routeHandler((req, res) => {
        res.render('login', { status: req.query.status, reason: req.query.reason, currentPage: 'login' });
    })
);

/**
 * Renders the registration page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/register', 
    logUserActivity, 
    isNotAuthenticated,
    routeHandler((req, res) => {
        res.render('register', { status: req.query.status, currentPage: 'register' });
    })
);

/**
 * Renders the account page for logged-in users
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/account', 
    isAuthenticated,
    isRegularUser,
    logUserActivity, 
    routeHandler((req, res) => {
        res.render('account', { account: req.session.user, status: req.query.status, currentPage: 'account' });
    })
);

/**
 * Renders the view set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/view_set', 
    isAuthenticated,
    isRegularUser,
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const cookie = getCookie(req);
        let setID = req.query.setID;
        let setType = req.query.set_type || 'user';
        const cards = await axios.get(`http://localhost:${port}/api/getCardsInSet`, {
            params: { setID, setType },
            headers: { cookie }
        });

        const set = await axios.get(`http://localhost:${port}/api/getSet`, {
            params: { setID, set_type: setType },
            headers: { cookie }
        });
        
        await axios.put(`http://localhost:${port}/api/incrementSetViews`, 
            { setID },
            { headers: { cookie } } // Separate the headers from the data
        );

        //add owner info to set object
        const owner = await UserService.getUserByIdentifier(set.data.result.ownerID);
        set.data.result.ownerID = {username: owner?.username || '', email: owner?.email || ''};

        res.render("view_set", { 
            set: set.data.result, 
            cards: cards.data.result, 
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
            currentPage: 'view_set',
            shared: setType === 'shared' ? true : false,
            public: setType === 'public' ? true : false,
            modaccess: setType === 'modaccess' ? true : false
        });
    })
);

/**
 * Renders the edit set page with cards
 * @param req - Express request object containing set data
 * @param res - Express response object
 * @throws {Error} If fetching set data or cards fails
 */
controller.get('/edit_set', 
    isAuthenticated,
    isRegularUser,
    logUserActivity, 
    asyncHandler(async (req, res) => {
        const cookie = getCookie(req);
        let setID = req.query.setID;
        
        const cards = await axios.get(`http://localhost:${port}/api/getCardsInSet`, {
            params: { setID },
            headers: { cookie }
        });

        const set = await axios.get(`http://localhost:${port}/api/getSet`, {
            params: { setID },
            headers: { cookie }
        });
        
        res.render("edit_set", { set: set.data.result, cards: cards.data.result, categoryNames, subcategories: {
            [Category.Language]: SubCategory_Language,
            [Category.Technology]: SubCategory_Technology,
            [Category.CourseSubjects]: SubCategory_CourseSubjects,
            [Category.Law]: SubCategory_Law,
            [Category.Medical]: SubCategory_Medical,
            [Category.Military]: SubCategory_Military
        }, status: req.query.status, currentPage: 'edit_set' });
    })
);

/**
 * Renders the new set creation page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('/new_set', 
    isAuthenticated,
    isRegularUser,
    logUserActivity,
    routeHandler((req, res) => {
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
    })
);

controller.get('/test', 
    isAuthenticated,
    isRegularUser,
    logUserActivity,
    asyncHandler(async (req, res) => {
        const baseURL = `${req.protocol}://${req.get('host')}/api`;

        // Fetch all sets first to get a valid setID
        const userSets = await axios.get('http://localhost:' + port + '/api/getSets', {
            headers: {
                cookie: req.headers.cookie || ''
            }
        });
        let setID = userSets.data.result.length > 0 ? userSets.data.result[0].setID : null;
        // List of endpoints to test
        const endpoints = [
            { path: '/getSets', role: 'regular', params: {setType: 'user'} },
            { path: '/getSet', role: 'regular', params: { setID, setType: 'user' } },
            { path: '/getSets', role: 'regular', params: {setType: 'shared'} },
            { path: '/getCardsInSet', role: 'regular', params: { setID } },
            { path: '/getUserActivity', role: 'moderator', params: { time_period: 'alltime' }},
            { path: '/getAllUsersActivity', role: 'moderator', params: { time_period: 'alltime' }},
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
                        headers: { Cookie: req.headers.cookie || '' } // Pass user session cookies for authentication
                    });
                    results[endpoint.path] = {
                        status: response.status,
                        data: (Array.isArray(response.data.results) && response.data.results.length === 0) ? "Nothing Returned" : response.data
                    };

                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        results[endpoint.path] = {
                            status: error.response?.status || 500, // Use actual status code if available
                            error: error.response?.status === 403 ? 'Your account is not authorized to test this route' : 'Request failed: ' + (error.response?.statusText || 'Unknown Error'),
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

        res.render("test_results", { results, currentPage: 'test' });
    })
);

/**
 * Handles 404 errors by serving the not found page
 * @param req - Express request object
 * @param res - Express response object
 */
controller.get('*', 
    routeHandler((req, res) => {
        res.render('error', {error:"404: Page not found", action: req.originalUrl});
    })
);

controller.listen(port, () => {console.log(`Server is running on port ${port}`);});

