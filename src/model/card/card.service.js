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
exports.CardService = void 0;
const databaseService_1 = require("../database/databaseService");
const card_types_1 = require("./card.types");
class CardService {
    /**
     * Adds a new card to a card set.
     * @param card - The card to add, containing setID, front_text, and back_text
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     * @throws Will return MISSING_INFORMATION if required fields are missing
     * @throws Will return SET_DOES_NOT_EXIST if the target set doesn't exist
     */
    static addCardToSet(card) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate required fields
                if (!card.setID || !card.front_text || !card.back_text) {
                    return card_types_1.CardAddStatus.MISSING_INFORMATION;
                }
                const db = yield databaseService_1.DatabaseService.getConnection();
                // Check if the set exists
                const [setRows] = yield db.connection.execute("SELECT setID FROM card_sets WHERE setID = ?", [card.setID]);
                if (!setRows || setRows.length === 0) {
                    return card_types_1.CardAddStatus.SET_DOES_NOT_EXIST;
                }
                // Insert the new card
                yield db.connection.execute("INSERT INTO card_data (setID, front_text, back_text) VALUES (?, ?, ?)", [card.setID, card.front_text, card.back_text]);
                return card_types_1.CardAddStatus.SUCCESS;
            }
            catch (error) {
                console.error("Failed to add card to set:", error);
                return card_types_1.CardAddStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Deletes a card from a card set.
     * @param card - The card to delete, containing setID, front_text, and back_text
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     * @throws Will return MISSING_INFORMATION if setID is missing
     * @throws Will return SET_DOES_NOT_EXIST if the target set doesn't exist
     * @throws Will return CARD_DOES_NOT_EXIST if the card doesn't exist in the set
     */
    static deleteCardFromSet(card) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate required fields
                if (!card.setID) {
                    return card_types_1.CardRemoveStatus.MISSING_INFORMATION;
                }
                const db = yield databaseService_1.DatabaseService.getConnection();
                // Check if the set exists
                const [setRows] = yield db.connection.execute("SELECT setID FROM card_sets WHERE setID = ?", [card.setID]);
                if (!setRows || setRows.length === 0) {
                    return card_types_1.CardRemoveStatus.SET_DOES_NOT_EXIST;
                }
                // Delete the card
                const [result] = yield db.connection.execute("DELETE FROM card_data WHERE setID = ? AND front_text = ? AND back_text = ?", [card.setID, card.front_text, card.back_text]);
                if (result.affectedRows === 0) {
                    return card_types_1.CardRemoveStatus.CARD_DOES_NOT_EXIST;
                }
                return card_types_1.CardRemoveStatus.SUCCESS;
            }
            catch (error) {
                console.error("Failed to delete card from set:", error);
                return card_types_1.CardRemoveStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Retrieves all cards within a specific set.
     * @param setID - The ID of the card set to retrieve cards from
     * @returns Promise resolving to an array of cards or a status code
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     * @throws Will return SET_DOES_NOT_EXIST if the target set doesn't exist
     * @throws Will return SET_HAS_NO_CARDS if the set exists but has no cards
     */
    static getCards(setID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                // Check if the set exists
                const [setRows] = yield db.connection.execute("SELECT setID FROM card_sets WHERE setID = ?", [setID]);
                if (!setRows || setRows.length === 0) {
                    return card_types_1.CardGetStatus.SET_DOES_NOT_EXIST;
                }
                // Get all cards for the set
                const [cardRows] = yield db.connection.execute("SELECT * FROM card_data WHERE setID = ?", [setID]);
                if (!cardRows || cardRows.length === 0) {
                    return card_types_1.CardGetStatus.SET_HAS_NO_CARDS;
                }
                // Convert database rows to Card objects
                return cardRows.map(row => ({
                    setID: row.setID,
                    front_text: row.front_text,
                    back_text: row.back_text
                }));
            }
            catch (error) {
                console.error("Failed to get cards for set:", error);
                return card_types_1.CardGetStatus.DATABASE_FAILURE;
            }
        });
    }
}
exports.CardService = CardService;
