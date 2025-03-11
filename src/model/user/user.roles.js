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
exports.Administrator = exports.Moderator = exports.Regular = void 0;
const card_service_1 = require("../card/card.service");
const cardset_service_1 = require("../cardSet/cardset.service");
const user_types_1 = require("./user.types");
const user_service_1 = require("./user.service");
class Regular {
    /**
     * Constructs a new Regular user.
     */
    constructor(username, email) {
        this.role = user_types_1.Role.REGULAR;
        this.username = username;
        this.email = email;
    }
    addSet(card_set) {
        return __awaiter(this, void 0, void 0, function* () {
            return cardset_service_1.CardSetService.addSet(this, card_set);
        });
    }
    deleteSet(setID) {
        return __awaiter(this, void 0, void 0, function* () {
            return cardset_service_1.CardSetService.deleteSet(setID);
        });
    }
    getAllSets() {
        return __awaiter(this, void 0, void 0, function* () {
            return cardset_service_1.CardSetService.getAllSets(this);
        });
    }
    getSet(setID) {
        return __awaiter(this, void 0, void 0, function* () {
            return cardset_service_1.CardSetService.getSet(setID);
        });
    }
    addCardToSet(card) {
        return __awaiter(this, void 0, void 0, function* () {
            return card_service_1.CardService.addCardToSet(card);
        });
    }
    deleteCardFromSet(card) {
        return __awaiter(this, void 0, void 0, function* () {
            return card_service_1.CardService.deleteCardFromSet(card);
        });
    }
    getCards(setID) {
        return __awaiter(this, void 0, void 0, function* () {
            return card_service_1.CardService.getCards(setID.toString());
        });
    }
    logAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_service_1.UserService.logUserAction(this, action);
        });
    }
    getWeeklyActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            const activity = yield user_service_1.UserService.getUserActivityLast7Days(this);
            return activity !== null && activity !== void 0 ? activity : [];
        });
    }
    getAllTimeActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            const activity = yield user_service_1.UserService.getUserActivityAllTime(this);
            return activity !== null && activity !== void 0 ? activity : [];
        });
    }
    getSharedSets() {
        return __awaiter(this, void 0, void 0, function* () {
            return cardset_service_1.CardSetService.getSharedSets(this);
        });
    }
    changeDetails(username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_service_1.UserService.changeUserDetails(this, username, email);
        });
    }
    changePassword(currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return user_service_1.UserService.changeUserPassword(this, currentPassword, newPassword);
        });
    }
}
exports.Regular = Regular;
class Moderator extends Regular {
    constructor() {
        super(...arguments);
        this.role = user_types_1.Role.MODERATOR;
    }
    getRegularUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return user_service_1.UserService.getRegularUsers();
        });
    }
    getUsersWeeklyActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            //Get the regular users
            const regularUsers = yield this.getRegularUsers();
            //Fetch the activity for each user and format the result
            const userActivities = {};
            for (const user of regularUsers) {
                const username = user.username;
                const activity = yield user_service_1.UserService.getUserActivityLast7Days(user);
                //Only add the activity if it's not null
                if (activity) {
                    userActivities[username] = activity;
                }
            }
            return userActivities;
        });
    }
    getUsersAllTimeActivity() {
        return __awaiter(this, void 0, void 0, function* () {
            //Get the regular users
            const regularUsers = yield this.getRegularUsers();
            //Fetch the activity for each user and format the result
            const userActivities = {};
            for (const user of regularUsers) {
                const username = user.username;
                const activity = yield user_service_1.UserService.getUserActivityAllTime(user);
                //Only add the activity if it's not null
                if (activity) {
                    userActivities[username] = activity;
                }
            }
            return userActivities;
        });
    }
    banUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return user_types_1.banResult.SUCCESS;
        });
    }
    unbanUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return user_types_1.unbanResult.SUCCESS;
        });
    }
}
exports.Moderator = Moderator;
class Administrator extends Moderator {
    constructor() {
        super(...arguments);
        this.role = user_types_1.Role.ADMINISTRATOR;
    }
    getModeratorUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return user_service_1.UserService.getModeratorUsers();
        });
    }
}
exports.Administrator = Administrator;
