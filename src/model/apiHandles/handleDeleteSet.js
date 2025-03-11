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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteSet = handleDeleteSet;
const utility_1 = require("../utility");
const user_roles_1 = require("../user/user.roles");
const cardset_service_1 = require("../cardSet/cardset.service");
const cardset_types_1 = require("../cardSet/cardset.types");
/**
 * Handles the deletion of a card set.
 * @param req - Express request object containing the session and query parameters
 * @param res - Express response object for sending responses and redirects
 * @returns Promise<void>
 * @throws Will redirect to homepage if user is not logged in
 * @throws Will redirect to homepage with unauthorized status if user is not a regular user
 * @throws Will attempt to delete the set if user is authorized
 */
function handleDeleteSet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if the user is logged in
        if (req.session.user) {
            // Check if the user is a regular user
            if ((0, utility_1.isRegular)(req.session.user)) {
                // Convert session user to Regular instance and fetch all sets
                const user = Object.assign(new user_roles_1.Regular("", ""), req.session.user);
                const setID = Number(req.body.setID);
                if (isNaN(setID)) {
                    res.status(400).json({ error: 'Invalid set ID' });
                    return;
                }
                const status = yield cardset_service_1.CardSetService.deleteSet(setID);
                if (status === cardset_types_1.CardSetRemoveStatus.SET_DOES_NOT_EXIST) {
                    res.send("SET DOES NOT EXIST <a href='/'> go back </a>");
                }
                else if (status === cardset_types_1.CardSetRemoveStatus.DATABASE_FAILURE) {
                    res.send("DATABASE FAILURE <a href='/'> go back </a>");
                }
                else if (status === cardset_types_1.CardSetRemoveStatus.SUCCESS) {
                    res.redirect('/');
                }
            }
            else {
                // Redirect unauthorized users
                res.redirect("/?status=unauthorized");
            }
        }
        else {
            // Redirect to the homepage if the user is not logged in
            res.redirect('/');
        }
    });
}
