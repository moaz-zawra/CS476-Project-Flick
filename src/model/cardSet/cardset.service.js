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
exports.CardSetService = void 0;
const databaseService_1 = require("../database/databaseService");
const user_service_1 = require("../user/user.service");
const cardset_types_1 = require("./cardset.types");
class CardSetService {
    /**
     * Adds a new card set for a given user.
     * @param user - The user adding the set
     * @param card_set - The card set to add, containing setName, category, and description
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static addSet(user, card_set) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!card_set.setName || !card_set.category || !card_set.subCategory || !card_set.description) {
                    return cardset_types_1.CardSetAddStatus.MISSING_INFORMATION;
                }
                const db = yield databaseService_1.DatabaseService.getConnection();
                const ownerID = yield user_service_1.UserService.getIDOfUser(user);
                const [rows] = yield db.connection.execute("SELECT 1 FROM card_sets WHERE set_name = ? AND ownerID = ? LIMIT 1", [card_set.setName, ownerID]);
                if (rows.length > 0)
                    return cardset_types_1.CardSetAddStatus.NAME_USED;
                yield db.connection.execute("INSERT INTO card_sets (ownerID, set_name, category, sub_category, description) VALUES (?, ?, ?, ?, ?)", [ownerID, card_set.setName, card_set.category, card_set.subCategory, card_set.description]);
                return cardset_types_1.CardSetAddStatus.SUCCESS;
            }
            catch (error) {
                console.error("Card set failed to be entered into DB:", error);
                return cardset_types_1.CardSetAddStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Deletes a card set by its ID.
     * @param setID - The ID of the set to delete
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static deleteSet(setID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (setID <= 0)
                    return cardset_types_1.CardSetRemoveStatus.SET_DOES_NOT_EXIST;
                const db = yield databaseService_1.DatabaseService.getConnection();
                const [rows] = yield db.connection.execute("SELECT 1 FROM card_sets WHERE setID = ? LIMIT 1", [setID]);
                if (rows.length === 0)
                    return cardset_types_1.CardSetRemoveStatus.SET_DOES_NOT_EXIST;
                yield db.connection.execute("DELETE FROM card_sets WHERE setID = ?", [setID]);
                return cardset_types_1.CardSetRemoveStatus.SUCCESS;
            }
            catch (error) {
                console.error("Failed to delete card set:", error);
                return cardset_types_1.CardSetRemoveStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Reports a card set for inappropriate content or other issues.
     * @param report - Object containing setID and reason for the report
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static reportSet(report) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                yield db.connection.execute("INSERT INTO reports (setID, reason) VALUES (?, ?)", [report.setID, report.reason || "No reason provided"]);
                return cardset_types_1.CardSetReportStatus.SUCCESS;
            }
            catch (error) {
                console.error("Failed to report set:", error);
                return cardset_types_1.CardSetReportStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Retrieves all card sets for a given user.
     * @param user - The user whose sets to retrieve
     * @returns Promise resolving to an array of card sets or a status code
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static getAllSets(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const ownerID = yield user_service_1.UserService.getIDOfUser(user);
                const [rows] = yield db.connection.execute("SELECT ownerID, set_name, category, sub_category, description, setID FROM card_sets WHERE ownerID = ?", [ownerID]);
                if (!rows || rows.length === 0) {
                    return cardset_types_1.CardSetGetStatus.USER_HAS_NO_SETS;
                }
                const sets = rows.map(row => ({
                    ownerID: row.ownerID,
                    setName: row.set_name,
                    category: row.category,
                    subCategory: row.sub_category,
                    description: row.description,
                    setID: row.setID
                }));
                return sets;
            }
            catch (error) {
                console.error("Failed to get card sets for user " + user.username + " with error: ", error);
                return cardset_types_1.CardSetGetStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Retrieves a specific card set by its ID.
     * @param setID - The ID of the set to retrieve
     * @param user - Optional user parameter for logging purposes
     * @returns Promise resolving to the card set or a status code
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static getSet(setID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const [rows] = yield db.connection.execute("SELECT ownerID, set_name, category, sub_category, description, setID FROM card_sets WHERE setID = ?", [setID]);
                if (rows.length === 0)
                    return cardset_types_1.CardSetGetStatus.SET_DOES_NOT_EXIST;
                const row = rows[0];
                return {
                    ownerID: row.ownerID,
                    setName: row.set_name,
                    category: row.category,
                    subCategory: row.sub_category,
                    description: row.description,
                    setID: row.setID
                };
            }
            catch (error) {
                console.error("Failed to get card set" + setID + " with error: ", error);
                return cardset_types_1.CardSetGetStatus.DATABASE_FAILURE;
            }
        });
    }
    static getSharedSets(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const [rows] = yield db.connection.execute("SELECT setID FROM shared_sets WHERE uID = ?", [yield user_service_1.UserService.getIDOfUser(user)]);
                let sets = [];
                if (rows.length === 0)
                    return cardset_types_1.CardSetGetStatus.USER_HAS_NO_SETS;
                for (const row of rows) {
                    if (row.setID) {
                        let res = yield this.getSet(row.setID);
                        if (res !== cardset_types_1.CardSetGetStatus.USER_HAS_NO_SETS && res !== cardset_types_1.CardSetGetStatus.SET_DOES_NOT_EXIST && res !== cardset_types_1.CardSetGetStatus.DATABASE_FAILURE) {
                            sets.push(res);
                        }
                    }
                }
                return sets;
            }
            catch (error) {
                console.error("Failed to get shared card sets with error: ", error);
                return cardset_types_1.CardSetGetStatus.DATABASE_FAILURE;
            }
        });
    }
}
exports.CardSetService = CardSetService;
