import express from "express";
import {Administrator, Moderator, Regular} from "./user/user.roles";
import {CardSetAddStatus, CardSetEditStatus, CardSetGetStatus, CardSetRemoveStatus, CardSetShareStatus, CardSetReportStatus} from "./cardSet/cardset.types";
import {CardAddStatus, CardEditStatus, CardGetStatus, CardRemoveStatus} from "./card/card.types";
import {UserCreator} from "./user/user.auth";
import {banResult, LoginStatus, RegisterStatus, unbanResult, UserAction, UserChangeStatus} from "./user/user.types";
import {UserService} from "./user/user.service";
import {makeCardSet, makeSetReport} from "./cardSet/cardset.model";
import {logUserAction, createUserFromSession} from "./utility";
import {makeCard} from "./card/card.model";


/**
 * Helper function to handle responses.
 *
 * @param res - The Express response object.
 * @param response_code - HTTP status code
 * @param route - Route to redirect to (if redirect) or empty for JSON response
 * @param status - The status to be included in response
 * @param jsonData - Optional JSON data to include in response
 */
export function handleResponse(
    res: express.Response, 
    response_code: number, 
    route: string, 
    status: string,
    jsonData?: any
  ): void {
    if (route) {
      // Check if the route already has query parameters
      const separator = route.includes('?') ? '&' : '?';
      res.status(response_code).redirect(`${route}${separator}status=${status}`);
    } else {
      res.status(response_code).json({ status, result: jsonData });
    }
  }

/**
 * Helper function to handle template rendering responses.
 *
 * @param res - The Express response object.
 * @param response_code - HTTP status code
 * @param template - Template to render
 * @param templateData - Data to pass to the template
 */
export function handleTemplateResponse(
    res: express.Response,
    response_code: number,
    template: string,
    templateData: any
): void {
    res.status(response_code).render(template, templateData);
}

export const GETOK = 200;
export const POSTOK = 201;
export const BADREQUEST = 400;
export const NOTAUTH = 401;
export const FORBIDDEN = 403;
export const NOTFOUND = 404;
export const SERVERERROR = 500;
export const CONFLICT = 409;

export class APIService{
    static async handleIncrementSetViews(req: express.Request, res: express.Response) {
        const user: Regular = createUserFromSession(req, Regular);
        const setID = parseInt(req.body.setID as string);
        console.log("in handleIncrementSetViews, setID is " + setID);

        const result = await user.incrementSetViews(setID);
        switch(result){
            case CardSetRemoveStatus.DATABASE_FAILURE:
                return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleIncrementSetViews()', error: 'Database Error' });
            case CardSetRemoveStatus.SET_DOES_NOT_EXIST:
                return handleTemplateResponse(res, NOTFOUND, 'error', { action: 'APIService.handleIncrementSetViews()', error: 'Requested set does not exist in DB' });
            default:
                return handleResponse(res, GETOK, '', 'success', result);
        }
    }
    static async disapproveSet(req: express.Request, res: express.Response) {
        const user: Moderator = createUserFromSession(req, Moderator);
        const setID = parseInt(req.body.setID as string);
        const result = await user.disapproveSet(setID);

        switch(result){
            case CardSetRemoveStatus.SUCCESS:
                return handleResponse(res, POSTOK, '/', 'success');
            case CardSetRemoveStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/', 'error');
            case CardSetRemoveStatus.SET_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/', 'does-not-exist');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }
    static async approveSet(req: express.Request, res: express.Response) {
        const user: Moderator = createUserFromSession(req, Moderator);
        const setID = parseInt(req.body.setID as string);
        const result = await user.approveSet(setID);

        switch(result){
            case CardSetRemoveStatus.SUCCESS:
                return handleResponse(res, POSTOK, '/', 'success');
            case CardSetRemoveStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/', 'error');
            case CardSetRemoveStatus.SET_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/', 'does-not-exist');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }
    static async handleDismissReport(req: express.Request, res: express.Response) {
        const user: Moderator = createUserFromSession(req, Moderator);
        const reportID = parseInt(req.body.reportID as string);
        const result = await user.dismissReport(reportID);
        switch (result) {
            case CardSetRemoveStatus.SUCCESS:
                return handleResponse(res, POSTOK, '/', 'success');
            case CardSetRemoveStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/', 'error');
            case CardSetRemoveStatus.SET_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/', 'does-not-exist');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }
    static async handleGetUnapprovedSets(req: express.Request, res: express.Response) {
        const user: Moderator = createUserFromSession(req, Moderator);
        const result = await user.getUnapprovedSets();

        switch (result) {
            case CardSetGetStatus.DATABASE_FAILURE:
                return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleGetSets()', error: 'Database Error' });
            case CardSetGetStatus.USER_HAS_NO_SETS:
                return handleResponse(res, GETOK, '', 'no_sets', []);
            default:
                return handleResponse(res, GETOK, '', 'success', result);
        }
    }
    //All of these functions assume req.session.user has already been authenticated in the route beforehand

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //GET Handlers
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static async handleGetSets(req: express.Request, res: express.Response, setType: string): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.getAllSets(setType);

        switch (result) {
            case CardSetGetStatus.DATABASE_FAILURE:
                return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleGetSets()', error: 'Database Error' });
            case CardSetGetStatus.USER_HAS_NO_SETS:
                return handleResponse(res, GETOK, '', 'no_sets', []);
            default:
                return handleResponse(res, GETOK, '', 'success', result);
        }
    }

    static async handleGetSet(req: express.Request, res: express.Response, setType: string): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const setID = parseInt(req.query.setID as string);

        const result = await user.getSet(setID, setType);

        switch (result) {
            case CardSetGetStatus.DATABASE_FAILURE:
                return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleGetSet()', error: 'Database Error' });
            case CardSetGetStatus.SET_DOES_NOT_EXIST:
                return handleTemplateResponse(res, NOTFOUND, 'error', { action: 'APIService.handleGetSet()', error: 'Requested set does not exist in DB' });
            default:
                return handleResponse(res, GETOK, '', 'success', result);
        }
    }

    static async handleGetCardsInSet(req: express.Request, res: express.Response): Promise<void> {
        const setID = parseInt(req.query.setID as string);
        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.getCards(setID);

        switch (result) {
            case CardGetStatus.DATABASE_FAILURE:
                return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleGetCardsInSet()', error: 'Database Error' });
            case CardGetStatus.SET_DOES_NOT_EXIST:
                return handleTemplateResponse(res, NOTFOUND, 'error', { action: 'APIService.handleGetCardsInSet()', error: 'Requested set does not exist in DB' });
            case CardGetStatus.SET_HAS_NO_CARDS:
                return handleResponse(res, GETOK, '', 'no_cards', []);
            default:
                return handleResponse(res, GETOK, '', 'success', result);
        }
    }

    static async handleGetUserActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const time_period = req.query.time_period as string;

        let result;
        if (time_period === "alltime") {
            result = await user.getAllTimeActivity();
        } else {
            result = await user.getWeeklyActivity();
        }

        if (result) {
            return handleResponse(res, GETOK, '', 'success', result);
        } else {
            return handleResponse(res, NOTFOUND, '', 'no_data', []);
        }
    }

    static async handleGetUsersActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = createUserFromSession(req, Moderator);
        const time_period = req.query.time_period as string;

        let result;
        if (time_period === "alltime") {
            result = await user.getUsersAllTimeActivity();
        } else {
            result = await user.getUsersWeeklyActivity();
        }

        if (result) {
            return handleResponse(res, GETOK, '', 'success', result);
        } else {
            return handleResponse(res, NOTFOUND, '', 'no_data', []);
        }
    }

    static async handleGetRegulars(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = createUserFromSession(req, Moderator);
        const result = await user.getRegularUsers();

        if (result) {
            return handleResponse(res, GETOK, '', 'success', result);
        } else {
            return handleResponse(res, NOTFOUND, '', 'no_data', [""]);
        }
    }

    static async handleGetModerators(req: express.Request, res: express.Response): Promise<void> {
        const user: Administrator = createUserFromSession(req, Administrator);
        const result = await user.getModeratorUsers();

        if (result) {
            return handleResponse(res, GETOK, '', 'success', result);
        } else {
            return handleResponse(res, NOTFOUND, '', 'no_data', [""]);
        }
    }
    static async handleGetReportedSets(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = createUserFromSession(req, Moderator);
        const result = await user.getReportedSets();

        switch (result) {
            case CardSetGetStatus.DATABASE_FAILURE:
                return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleGetSets()', error: 'Database Error' });
            case CardSetGetStatus.USER_HAS_NO_SETS:
                return handleResponse(res, GETOK, '', 'no_sets', []);
            default:
                return handleResponse(res, GETOK, '', 'success', result);
        }
    }
    
    //POST handlers
    static async handleLogin(req: express.Request, res: express.Response): Promise<void> {
        const user = await new UserCreator().login(req.body.identifier, req.body.password);

        if (typeof user === 'object' && 'status' in user && user.status === LoginStatus.USER_IS_BANNED) {
            return res.redirect(`/login?status=user-is-banned&reason=${encodeURIComponent(user.reason)}`);
        }

        switch (user) {
            case LoginStatus.USER_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/login', 'does-not-exist');
            case LoginStatus.WRONG_PASSWORD:
                return handleResponse(res, NOTAUTH, '/login', 'wrong-password');
            case LoginStatus.OTHER:
            case LoginStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/login', 'error');
            default:
                req.session.user = user;
                return res.redirect('/');
        }
    }

    static async handleRegister(req: express.Request, res: express.Response): Promise<void> {
        const { username, email, password, cpassword } = req.body;

        if (username && email && password && cpassword) {
            const result = await new UserCreator().registerUser(username, email, password, cpassword);

            switch (result) {
                case RegisterStatus.SUCCESS:
                    return handleResponse(res, POSTOK, '/login', 'registration-success');
                case RegisterStatus.USERNAME_USED:
                    return handleResponse(res, CONFLICT, '/register', 'username-used');
                case RegisterStatus.EMAIL_USED:
                    return handleResponse(res, CONFLICT, '/register', 'email-used');
                case RegisterStatus.BAD_PASSWORD:
                    return handleResponse(res, BADREQUEST, '/register', 'bad-password');
                case RegisterStatus.PASSWORD_MISMATCH:
                    return handleResponse(res, BADREQUEST, '/register', 'mismatch-password');
                case RegisterStatus.DATABASE_FAILURE:
                    return handleResponse(res, SERVERERROR, '/register', 'error');
                default:
                    return handleResponse(res, BADREQUEST, '/register', 'unknown-error');
            }
        } else {
            return handleResponse(res, BADREQUEST, '/register', 'missing-fields');
        }
    }

    static async handleNewSet(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Regular);
        const uID = await UserService.getIDOfUser(user.username);

        const { setName, category, subcategory, setDesc, publicSet } = req.body;

        if (setName && category && subcategory && setDesc) {
            const set = makeCardSet(uID, setName, category, subcategory, setDesc, undefined, (publicSet === 'on'), false);
            const result = await user.addSet(set);

            switch (result) {
                case CardSetAddStatus.SUCCESS:
                    logUserAction(req, res, UserAction.NEWSET);
                    return handleResponse(res, POSTOK, '/', 'success');
                case CardSetAddStatus.MISSING_INFORMATION:
                    return handleResponse(res, BADREQUEST, '/new_set', 'missing-fields');
                case CardSetAddStatus.NAME_USED:
                    return handleResponse(res, CONFLICT, '/new_set', 'name-used');
                case CardSetAddStatus.DATABASE_FAILURE:
                    return handleResponse(res, SERVERERROR, '/new_set', 'error');
                default:
                    return handleResponse(res, BADREQUEST, '/new_set', 'unknown-error');
            }
        } else {
            return handleResponse(res, BADREQUEST, '/new_set', 'missing-fields');
        }
    }

    static async handleNewCard(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Regular);
        const { front_text, back_text, setID } = req.body;

        if (front_text && back_text && setID) {
            logUserAction(req, res, UserAction.NEWCARD);
            const card = makeCard(setID, front_text, back_text);
            const result = await user.addCardToSet(card);

            switch (result) {
                case CardAddStatus.SUCCESS:
                    return handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
                case CardAddStatus.MISSING_INFORMATION:
                    return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
                case CardAddStatus.SET_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
                case CardAddStatus.DATABASE_FAILURE:
                    return handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
                default:
                    return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'unknown-error');
            }
        } else {
            return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
        }
    }

    static async handleShareSet(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Regular);
        const { setID, username } = req.body;

        if (user.username === username) {
            return handleResponse(res, CONFLICT, '/', 'already-shared');
        }

        if (setID && username) {
            const result = await user.shareSet(parseInt(setID), username);

            switch (result) {
                case CardSetShareStatus.SUCCESS:
                    return handleResponse(res, POSTOK, '/', 'success');
                case CardSetShareStatus.USER_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, '/', 'user-does-not-exist');
                case CardSetShareStatus.SET_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, '/', 'set-does-not-exist');
                case CardSetShareStatus.ALREADY_SHARED:
                    return handleResponse(res, CONFLICT, '/', 'already-shared');
                case CardSetShareStatus.DATABASE_FAILURE:
                    return handleTemplateResponse(res, SERVERERROR, 'error', { action: 'APIService.handleShareSet()', error: 'Database Error' });
                default:
                    return handleResponse(res, BADREQUEST, '/', 'unknown-error');
            }
        } else {
            return handleResponse(res, BADREQUEST, '/', 'missing-fields');
        }
    }

    static async handleBan(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Moderator);
        const { username, reason } = req.body;

        const result = await user.banUser(username, reason);
        switch (result){
            case banResult.SUCCESS:
                return handleResponse(res, POSTOK, '/', 'success');
            case banResult.USER_ALREADY_BANNED:
                return handleResponse(res, CONFLICT, '/', 'already-banned');
            case banResult.USER_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/', 'user-does-not-exist');
            case banResult.USER_IS_ADMIN:
                return handleResponse(res, FORBIDDEN, '/', 'user-is-admin');
            case banResult.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/', 'error');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }
    static async handleUnBan(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Moderator);
        const { username, reason } = req.body;

        const result = await user.unbanUser(username, reason);
        switch (result){
            case(unbanResult.SUCCESS):
                return handleResponse(res, POSTOK, '/', 'success');
            case(unbanResult.USER_NOT_BANNED):
                return handleResponse(res, CONFLICT, '/', 'not-banned');
            case(unbanResult.USER_DOES_NOT_EXIST):
                return handleResponse(res, NOTFOUND, '/', 'user-does-not-exist');
            case(unbanResult.DATABASE_FAILURE):
                return handleResponse(res, SERVERERROR, '/', 'error');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }

    //PUT handlers
    static async handleEditUser(req: express.Request, res: express.Response): Promise<void> {
        const action = req.body.action;

        if (action === 'change_details') {
            const { username, email, oldUsername, oldEmail } = req.body;

            if (username && email && oldUsername && oldEmail) {
                if (username === oldUsername && email === oldEmail) {
                    return handleResponse(res, POSTOK, '/account', '');
                } else {
                    const user = createUserFromSession(req, Regular);

                    if (username !== oldUsername) {
                        const isUsernameTaken = await UserService.doesUserExist(username);
                        if (isUsernameTaken) {
                            return handleResponse(res, CONFLICT, '/account', 'username-used');
                        }
                    }

                    if (email !== oldEmail) {
                        const isEmailTaken = await UserService.doesUserExist(email);
                        if (isEmailTaken) {
                            return handleResponse(res, CONFLICT, '/account', 'email-used');
                        }
                    }

                    const result = await user.changeDetails(username, email);

                    switch (result) {
                        case UserChangeStatus.SUCCESS:
                            req.session.user = Object.assign(req.session.user, { username, email });
                            return handleResponse(res, POSTOK, '/account', 'success');
                        case UserChangeStatus.USER_DOES_NOT_EXIST:
                            return handleResponse(res, BADREQUEST, '/account', 'user-does-not-exist');
                        case UserChangeStatus.DATABASE_FAILURE:
                            return handleResponse(res, SERVERERROR, '/account', 'error');
                        case UserChangeStatus.INCORRECT_PASSWORD:
                            return handleResponse(res, NOTAUTH, '/account', 'incorrect-password');
                        case UserChangeStatus.USERNAME_USED:
                            return handleResponse(res, CONFLICT, '/account', 'username-used');
                        case UserChangeStatus.EMAIL_USED:
                            return handleResponse(res, CONFLICT, '/account', 'email-used');
                        default:
                            return handleResponse(res, BADREQUEST, '/account', 'unknown-error');
                    }
                }
            } else {
                return handleResponse(res, BADREQUEST, '/account', 'missing-fields');
            }
        } else if (action === 'change_password') {
            const { current_password, new_password } = req.body;

            if (current_password && new_password) {
                const user = createUserFromSession(req, Regular);
                const result = await user.changePassword(current_password, new_password);

                switch (result) {
                    case UserChangeStatus.SUCCESS:
                        return handleResponse(res, POSTOK, '/account', 'success');
                    case UserChangeStatus.USER_DOES_NOT_EXIST:
                        return handleResponse(res, BADREQUEST, '/account', 'user-does-not-exist');
                    case UserChangeStatus.DATABASE_FAILURE:
                        return handleResponse(res, SERVERERROR, '/account', 'error');
                    case UserChangeStatus.INCORRECT_PASSWORD:
                        return handleResponse(res, NOTAUTH, '/account', 'incorrect-password');
                    default:
                        return handleResponse(res, BADREQUEST, '/account', 'unknown-error');
                }
            } else {
                return handleResponse(res, BADREQUEST, '/account', 'missing-fields');
            }
        } else {
            return handleResponse(res, BADREQUEST, '/', 'invalid-action');
        }
    }

    static async handleEditSet(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const uID = await UserService.getIDOfUser(user.username);
        const setID = parseInt(req.body.setID as string);
        const { setName, category, subcategory, setDesc } = req.body;

        if (setName && category && subcategory && setDesc && setID) {
            const set = makeCardSet(uID, setName, category, subcategory, setDesc, setID);
            const result = await user.editSet(set);

            switch (result) {
                case CardSetEditStatus.SUCCESS:
                    return handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
                case CardSetEditStatus.MISSING_INFORMATION:
                    return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
                case CardSetEditStatus.NAME_USED:
                    return handleResponse(res, CONFLICT, `/edit_set?setID=${setID}`, 'name-used');
                case CardSetEditStatus.SET_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
                case CardSetEditStatus.DATABASE_FAILURE:
                    return handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
                default:
                    return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'unknown-error');
            }
        } else {
            return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
        }
    }

    static async handleEditCard(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const { front_text, back_text, cardID, setID } = req.body;

        if (front_text && back_text && cardID && setID) {
            const card = makeCard(setID, front_text, back_text, cardID);
            const result = await user.editCardInSet(card);

            switch (result) {
                case CardEditStatus.SUCCESS:
                    return handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
                case CardEditStatus.MISSING_INFORMATION:
                    return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
                case CardEditStatus.SET_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
                case CardEditStatus.CARD_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'card-does-not-exist');
                case CardEditStatus.DATABASE_FAILURE:
                    return handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
                default:
                    return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'unknown-error');
            }
        } else {
            return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
        }
    }

    //DELETE handlers
    static async handleDeleteSet(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const setID = parseInt((req.query.setID || req.body.setID) as string);
        console.log("in handleDeleteSet, setID is " + setID);
        const result = await user.deleteSet(setID);
        switch (result) {
            case CardSetRemoveStatus.SUCCESS:
                return handleResponse(res, POSTOK, '/', 'success');
            case CardSetRemoveStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/', 'error');
            case CardSetRemoveStatus.SET_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/', 'does-not-exist');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }
    static async handleDeleteCard(req: express.Request, res: express.Response): Promise<void> {
        const cardID = Number(req.query.cardID || req.body.cardID);
        const setID = Number(req.query.setID || req.body.setID);

        if (!cardID || !setID) {
            return handleResponse(res, BADREQUEST, '/', 'missing-fields');
        }

        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.deleteCardFromSet(cardID, setID);

        switch (result) {
            case CardRemoveStatus.SUCCESS:
                return handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
            case CardRemoveStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
            case CardRemoveStatus.SET_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
            case CardRemoveStatus.CARD_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'card-does-not-exist');
            case CardRemoveStatus.MISSING_INFORMATION:
                return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
            default:
                return handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'unknown-error');
        }

    }
    static async handleDeleteUser(req: express.Request, res: express.Response): Promise<void> {}

    static async handleRemoveSharedSet(req: express.Request, res: express.Response): Promise<void> {
            const user: Regular = createUserFromSession(req, Regular);
            const setID = parseInt(req.query.setID as string || req.body.setID as string);
            
            if (!setID || isNaN(setID)) {
                return handleResponse(res, BADREQUEST, '/', 'missing-fields');
            }
            
            const result = await user.removeSharedSet(setID);

            switch (result) {
                case CardSetRemoveStatus.SUCCESS:
                    return handleResponse(res, GETOK, '/', 'success');
                case CardSetRemoveStatus.DATABASE_FAILURE:
                    return handleResponse(res, SERVERERROR, '/', 'error');
                case CardSetRemoveStatus.SET_DOES_NOT_EXIST:
                    return handleResponse(res, NOTFOUND, '/', 'not-shared');
                default:
                    return handleResponse(res, BADREQUEST, '/', 'unknown-error');
            }
    }

    static async handleReportSet(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const { setID, reason } = req.body;

        if (!setID || isNaN(Number(setID))) {
            return handleResponse(res, BADREQUEST, '/', 'missing-fields');
        }

        const report = makeSetReport(await UserService.getIDOfUser(user.username), Number(setID), reason);

        const result = await user.reportSet(report);

        switch (result) {
            case CardSetReportStatus.SUCCESS:
                return handleResponse(res, POSTOK, '/', 'success');
            case CardSetReportStatus.DATABASE_FAILURE:
                return handleResponse(res, SERVERERROR, '/', 'error');
            case CardSetReportStatus.SET_DOES_NOT_EXIST:
                return handleResponse(res, NOTFOUND, '/', 'set-does-not-exist');
            case CardSetReportStatus.ALREADY_REPORTED:
                return handleResponse(res, CONFLICT, '/', 'already-reported');
            default:
                return handleResponse(res, BADREQUEST, '/', 'unknown-error');
        }
    }
}
