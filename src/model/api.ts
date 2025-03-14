import express from "express";
import {Administrator, Moderator, Regular} from "./user/user.roles";
import {CardSetAddStatus, CardSetEditStatus, CardSetGetStatus, CardSetRemoveStatus, CardSetShareStatus} from "./cardSet/cardset.types";
import {CardAddStatus, CardGetStatus, CardRemoveStatus} from "./card/card.types";
import {UserCreator} from "./user/user.auth";
import {LoginStatus, RegisterStatus, UserAction, UserChangeStatus} from "./user/user.types";
import {UserService} from "./user/user.service";
import {makeCardSet} from "./cardSet/cardset.model";
import {logUserAction, createUserFromSession} from "./utility";
import {makeCard} from "./card/card.model";
import { ConsoleLogger } from "typedoc/dist/lib/utils";


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
    //All of these functions assume req.session.user has already been authenticated in the route beforehand

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //GET Handlers
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    static async handleGetSets(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.getAllSets();

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            handleTemplateResponse(res, SERVERERROR, 'error', {action: 'APIService.handleGetSets()', error:'Database Error'});
        }
        if(result === CardSetGetStatus.USER_HAS_NO_SETS){
            handleResponse(res, GETOK, '', 'no_sets', []);
        }
        else handleResponse(res, GETOK, '', 'success', result);
    }
    static async handleGetSet(req: express.Request, res: express.Response): Promise<void> {
        const setID = parseInt(req.query.setID as string);
        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.getSet(setID);

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            handleTemplateResponse(res, SERVERERROR, 'error', {action: 'APIService.handleGetSet()', error:'Database Error'});
        }
        if(result === CardSetGetStatus.SET_DOES_NOT_EXIST){
            handleTemplateResponse(res, NOTFOUND, 'error', {action: 'APIService.handleGetSet()', error:'Requested set does not exist in DB'});
        }
        else handleResponse(res, GETOK, '', 'success', result);
    }
    static async handleGetCardsInSet(req: express.Request, res: express.Response): Promise<void> {
        const setID = parseInt(req.query.setID as string);
        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.getCards(setID);

        if(result === CardGetStatus.DATABASE_FAILURE){
            handleTemplateResponse(res, SERVERERROR, 'error', {action: 'APIService.handleGetCardsInSet()', error:'Database Error'});
        }
        else if(result === CardGetStatus.SET_DOES_NOT_EXIST){
            handleTemplateResponse(res, NOTFOUND, 'error', {action: 'APIService.handleGetCardsInSet()', error:'Requested set does not exist in DB'});
        }
        else if(result === CardGetStatus.SET_HAS_NO_CARDS){
            handleResponse(res, GETOK, '', 'no_cards', []);
        }
        else handleResponse(res, GETOK, '', 'success', result);
    }
    static async handleGetSharedSets(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.getSharedSets();

        if(result === CardSetGetStatus.DATABASE_FAILURE){
            handleTemplateResponse(res, SERVERERROR, 'error', {action: 'APIService.handleGetSharedSets()', error:'Database Error'});
        }
        if(result === CardSetGetStatus.USER_HAS_NO_SETS){
            handleResponse(res, GETOK, '', 'no_shared_sets', []);
        }
        else handleResponse(res, GETOK, '', 'success', result);
    }
    static async handleGetUserActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const time_period = req.query.time_period as string;
        if(time_period === "alltime"){
            const result = await user.getAllTimeActivity();
            if(result){
                handleResponse(res, GETOK, '', 'success', result);
            } else handleResponse(res, NOTFOUND, '', 'no_data', []);
        }
        else{
            const result = await user.getWeeklyActivity();
            if(result){
                handleResponse(res, GETOK, '', 'success', result);
            } else handleResponse(res, NOTFOUND, '', 'no_data', []);
        }
    }

    static async handleGetUsersActivity(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = createUserFromSession(req, Moderator);
        const time_period = req.query.time_period as string;
        if(time_period === "alltime"){
            const result = await user.getUsersAllTimeActivity()
            if(result){
                handleResponse(res, GETOK, '', 'success', result);
                return;
            } else handleResponse(res, NOTFOUND, '', 'no_data', []);
        }
        else{
            const result = await user.getUsersWeeklyActivity()
            if(result){
                handleResponse(res, GETOK, '', 'success', result);
                return;
            } else handleResponse(res, NOTFOUND, '', 'no_data', [""]);
        }
    }

    static async handleGetRegulars(req: express.Request, res: express.Response): Promise<void> {
        const user: Moderator = createUserFromSession(req, Moderator);
        const result = await user.getRegularUsers()
        if(result){
            handleResponse(res, GETOK, '', 'success', result);
            return;
        }
        handleResponse(res, NOTFOUND, '', 'no_data', [""]);
    }
    static async handleGetModerators(req: express.Request, res: express.Response): Promise<void> {
        const user: Administrator = createUserFromSession(req, Administrator);
        const result = await user.getModeratorUsers()
        if(result){
            handleResponse(res, GETOK, '', 'success', result);
            return;
        }
        handleResponse(res, NOTFOUND, '', 'no_data', [""]);
    }

    //POST handlers
    static async handleLogin(req: express.Request, res: express.Response): Promise<void> {
        const user = await new UserCreator().login(req.body.identifier, req.body.password);
        if(user === LoginStatus.USER_DOES_NOT_EXIST){
            return handleResponse(res, NOTFOUND, '/login', 'does-not-exist');
        }
        else if (user === LoginStatus.WRONG_PASSWORD){
            return handleResponse(res, NOTAUTH, '/login', 'wrong-password');
        }
        else if (user === LoginStatus.OTHER || user === LoginStatus.DATABASE_FAILURE){
            return handleResponse(res, SERVERERROR, '/login', 'error');
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
                handleResponse(res, POSTOK, '/login', 'registration-success');
            }
            else if(result === RegisterStatus.USERNAME_USED){
                handleResponse(res, CONFLICT, '/register', 'username-used');
            }
            else if(result === RegisterStatus.EMAIL_USED){
                handleResponse(res, CONFLICT, '/register', 'email-used');
            }
            else if(result === RegisterStatus.BAD_PASSWORD){
                handleResponse(res, BADREQUEST, '/register', 'bad-password');
            }
            else if(result === RegisterStatus.PASSWORD_MISMATCH){
                handleResponse(res, BADREQUEST, '/register', 'mismatch-password');
            }
            else if(result === RegisterStatus.DATABASE_FAILURE){
                handleResponse(res, SERVERERROR, '/register', 'error');
            }
        } else handleResponse(res, BADREQUEST, '/register', 'missing-fields');
    }
    static async handleNewSet(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Regular);
        const uID = await UserService.getIDOfUser(user.username);

        const {setName, category, subcategory, setDesc} = req.body;
        if(setName && category && subcategory && setDesc){
            const set = makeCardSet(uID, setName, category, subcategory, setDesc);
            const result = await user.addSet(set);

            if(result === CardSetAddStatus.SUCCESS){
                logUserAction(req,res,UserAction.NEWSET)
                handleResponse(res, POSTOK, '/', 'success');
            }
            else if(result === CardSetAddStatus.MISSING_INFORMATION){
                handleResponse(res, BADREQUEST, '/new_set', 'missing-fields');
            }
            else if(result === CardSetAddStatus.NAME_USED){
                handleResponse(res, CONFLICT, '/new_set', 'name-used');
            }
            else if(result === CardSetAddStatus.DATABASE_FAILURE){
                handleResponse(res, SERVERERROR, '/new_set', 'error');
            }
        } else handleResponse(res, BADREQUEST, '/new_set', 'missing-fields');
    }
    static async handleNewCard(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Regular);
        const { front_text, back_text, setID } = req.body;

        if (front_text && back_text && setID) {
            UserService.logUserAction(user, UserAction.NEWCARD);
            const card = makeCard(setID, front_text, back_text);
            const result = await user.addCardToSet(card);

            if (result === CardAddStatus.SUCCESS) {
                handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
            } else if (result === CardAddStatus.MISSING_INFORMATION) {
                handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
            } else if (result === CardAddStatus.SET_DOES_NOT_EXIST) {
                handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
            } else if (result === CardAddStatus.DATABASE_FAILURE) {
                handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
            }
        } else {
            handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
        }
    }

    static async handleShareSet(req: express.Request, res: express.Response): Promise<void> {
        const user = createUserFromSession(req, Regular);
        const { setID, username } = req.body;
        if(user.username === username){
            return handleResponse(res, CONFLICT, '/', 'already-shared');
        }
        if (setID && username) {
            const result = await user.shareSet(parseInt(setID), username);

            if (result === CardSetShareStatus.SUCCESS) {
                return handleResponse(res, POSTOK, '/', 'success');
            } else if (result === CardSetShareStatus.USER_DOES_NOT_EXIST) {
                return handleResponse(res, NOTFOUND, '/', 'user-does-not-exist');
            } else if (result === CardSetShareStatus.SET_DOES_NOT_EXIST) {
                return handleResponse(res, NOTFOUND, '/', 'set-does-not-exist');
            } else if (result === CardSetShareStatus.ALREADY_SHARED) {
                return handleResponse(res, CONFLICT, '/', 'already-shared');
            } else if (result === CardSetShareStatus.DATABASE_FAILURE) {
                return handleTemplateResponse(res, SERVERERROR, 'error', {action: 'APIService.handleShareSet()', error:'Database Error'});
            }
        } else {
            return handleResponse(res, BADREQUEST, '/', 'missing-fields');
        }
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
                    handleResponse(res, POSTOK, '/account', '');
                }else{
                    const user = createUserFromSession(req, Regular);
                    
                    // Check if username or email is already in use before changing details
                    if(username !== oldUsername) {
                        // Check if username is already taken by someone else
                        const isUsernameTaken = await UserService.doesUserExist(username);
                        if(isUsernameTaken) {
                            return handleResponse(res, CONFLICT, '/account', 'username-used');
                        }
                    }
                    
                    if(email !== oldEmail) {
                        // Check if email is already taken by someone else
                        const isEmailTaken = await UserService.doesUserExist(email);
                        if(isEmailTaken) {
                            return handleResponse(res, CONFLICT, '/account', 'email-used');
                        }
                    }
                    
                    const result = await user.changeDetails(username,email);

                    if(result === UserChangeStatus.SUCCESS){
                        req.session.user = Object.assign(req.session.user, { username, email });
                        handleResponse(res, POSTOK, '/account', 'success');
                    } else if(result === UserChangeStatus.USER_DOES_NOT_EXIST){
                        handleResponse(res, BADREQUEST, '/account', 'user-does-not-exist');
                    } else if(result === UserChangeStatus.DATABASE_FAILURE){
                        handleResponse(res, SERVERERROR, '/account', 'error');
                    } else if(result === UserChangeStatus.INCORRECT_PASSWORD){
                        handleResponse(res, NOTAUTH, '/account', 'incorrect-password');
                    } else if(result === UserChangeStatus.USERNAME_USED){
                        handleResponse(res, CONFLICT, '/account', 'username-used');
                    } else if(result === UserChangeStatus.EMAIL_USED){
                        handleResponse(res, CONFLICT, '/account', 'email-used');
                    }
                }
            }else handleResponse(res, BADREQUEST, '/account', 'missing-fields');

        } else if (action === 'change_password') {
            const {current_password, new_password} = req.body;
            if(current_password && new_password){
                const user = createUserFromSession(req, Regular);

                const result = await user.changePassword(current_password,new_password);

                if(result === UserChangeStatus.SUCCESS){
                    handleResponse(res, POSTOK, '/account', 'success');
                } else if(result === UserChangeStatus.USER_DOES_NOT_EXIST){
                    handleResponse(res, BADREQUEST, '/account', 'user-does-not-exist');
                } else if(result === UserChangeStatus.DATABASE_FAILURE){
                    handleResponse(res, SERVERERROR, '/account', 'error');
                } else if(result === UserChangeStatus.INCORRECT_PASSWORD){
                    handleResponse(res, NOTAUTH, '/account', 'incorrect-password');
                }
            } else handleResponse(res, BADREQUEST, '/account', 'missing-fields');
        } else {
            handleResponse(res, BADREQUEST, '/', 'invalid-action');
        }
    }
    static async handleEditSet(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const uID = await UserService.getIDOfUser(user.username);
        const setID = parseInt(req.body.setID as string);
        const {setName, category, subcategory, setDesc} = req.body;
        //convert category to enum value
        
        if(setName && category && subcategory && setDesc && setID){
            const set = makeCardSet(uID, setName, category, subcategory, setDesc, setID);
            const result = await user.editSet(set);
            if (result === CardSetEditStatus.SUCCESS) {
                handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
            } else if (result === CardSetEditStatus.MISSING_INFORMATION) {
                handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
            } else if (result === CardSetEditStatus.NAME_USED) {
                handleResponse(res, CONFLICT, `/edit_set?setID=${setID}`, 'name-used');
            } else if (result === CardSetEditStatus.SET_DOES_NOT_EXIST) {
                handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
            } else if (result === CardSetEditStatus.DATABASE_FAILURE) {
                handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
            }

        } else handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
    }
    static async handleEditCard(req: express.Request, res: express.Response): Promise<void> {

    }

    //DELETE handlers
    static async handleDeleteSet(req: express.Request, res: express.Response): Promise<void> {
        const user: Regular = createUserFromSession(req, Regular);
        const setID = parseInt(req.body.setID as string);
        const result = await user.deleteSet(setID);

        if(result === CardSetRemoveStatus.SUCCESS){
            handleResponse(res, POSTOK, '/', 'success');
        }
        else if(result === CardSetRemoveStatus.DATABASE_FAILURE){
            handleResponse(res, POSTOK, '/', 'error');
        }
        else if(result === CardSetRemoveStatus.SET_DOES_NOT_EXIST){
            handleResponse(res, POSTOK, '/', 'does-not-exist');
        }
    }
    static async handleDeleteCard(req: express.Request, res: express.Response): Promise<void> {
        const cardID = Number(req.query.cardID || req.body.cardID);
        const setID = Number(req.query.setID || req.body.setID);
        if(!cardID || !setID) return handleResponse(res, BADREQUEST, '/', 'missing-fields');

        const user: Regular = createUserFromSession(req, Regular);
        const result = await user.deleteCardFromSet(cardID, setID);

        if (result === CardRemoveStatus.SUCCESS) {
            handleResponse(res, POSTOK, `/edit_set?setID=${setID}`, 'success');
        } else if (result === CardRemoveStatus.DATABASE_FAILURE) {
            handleResponse(res, SERVERERROR, `/edit_set?setID=${setID}`, 'error');
        } else if (result === CardRemoveStatus.SET_DOES_NOT_EXIST) {
            handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'set-does-not-exist');
        } else if (result === CardRemoveStatus.CARD_DOES_NOT_EXIST) {
            handleResponse(res, NOTFOUND, `/edit_set?setID=${setID}`, 'card-does-not-exist');
        } else if (result === CardRemoveStatus.MISSING_INFORMATION) {
            handleResponse(res, BADREQUEST, `/edit_set?setID=${setID}`, 'missing-fields');
        }

    }
    static async handleDeleteUser(req: express.Request, res: express.Response): Promise<void> {}
}
