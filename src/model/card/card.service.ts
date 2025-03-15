import { RowDataPacket } from "mysql2/promise";
import { DatabaseService } from "../database/databaseService";
import { User } from "../user/user.model";
import { UserService } from "../user/user.service";
import { Card, makeCard } from "./card.model";
import { CardAddStatus, CardRemoveStatus, CardGetStatus, CardEditStatus } from "./card.types";

export class CardService {
    /**
     * Edits a card in a card set.
     * @param card - The card with updated information to edit
     * @returns Promise resolving to the status of the operation
     */
    public static async editCardInSet(card: Card): Promise<CardEditStatus>{
        try{
            if (!card.setID || !card.front_text || !card.back_text || !card.cardID) {
                return CardEditStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [card.setID]
            );

            if(!setRows || (setRows as any[]).length === 0){
                return CardEditStatus.SET_DOES_NOT_EXIST;
            }

            const [cardRows] = await db.connection.execute(
                "SELECT cardID FROM card_data WHERE cardID = ?",
                [card.cardID]
            );

            if(!cardRows || (cardRows as any[]).length === 0){
                return CardEditStatus.CARD_DOES_NOT_EXIST;
            }

            await db.connection.execute(
                "UPDATE card_data SET front_text = ?, back_text = ? WHERE cardID = ? AND setID = ?",
                [card.front_text, card.back_text, card.cardID, card.setID]
            );

            return CardEditStatus.SUCCESS
        } catch(error){
            console.error("Failed to edit card in set:", error);
            return CardEditStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Adds a new card to a card set.
     * @param card - The card to add, containing setID, front_text, and back_text
     * @returns Promise resolving to the status of the operation
     */
    public static async addCardToSet(card: Card): Promise<CardAddStatus> {
        try {
            if (!card.setID || !card.front_text || !card.back_text) {
                return CardAddStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [card.setID]
            );

            if (!setRows || (setRows as any[]).length === 0) {
                return CardAddStatus.SET_DOES_NOT_EXIST;
            }

            await db.connection.execute(
                "INSERT INTO card_data (setID, front_text, back_text) VALUES (?, ?, ?)",
                [card.setID, card.front_text, card.back_text]
            );

            return CardAddStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to add card to set:", error);
            return CardAddStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Deletes a card from a card set by cardID and setID.
     * @param cardID - The ID of the card to delete
     * @param setID - The ID of the set to which the card belongs
     * @returns Promise resolving to the status of the operation
     */
    public static async deleteCardFromSet(cardID: number, setID: number): Promise<CardRemoveStatus> {
        try {
            if (!cardID || !setID) {
                return CardRemoveStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [setID]
            );

            if (!setRows || (setRows as any[]).length === 0) {
                return CardRemoveStatus.SET_DOES_NOT_EXIST;
            }

            const [result] = await db.connection.execute(
                "DELETE FROM card_data WHERE cardID = ? AND setID = ?",
                [cardID, setID]
            );

            if ((result as any).affectedRows === 0) {
                return CardRemoveStatus.CARD_DOES_NOT_EXIST;
            }

            return CardRemoveStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to delete card from set:", error);
            return CardRemoveStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Retrieves all cards within a specific set.
     * @param setID - The ID of the card set to retrieve cards from
     * @returns Promise resolving to an array of cards or a status code
     */
    public static async getCards(setID: string): Promise<Card[] | CardGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [setID]
            );

            if (!setRows || (setRows as any[]).length === 0) {
                return CardGetStatus.SET_DOES_NOT_EXIST;
            }

            const [cardRows] = await db.connection.execute(
                "SELECT * FROM card_data WHERE setID = ?",
                [setID]
            );

            if (!cardRows || (cardRows as any[]).length === 0) {
                return CardGetStatus.SET_HAS_NO_CARDS;
            }

            return (cardRows as any[]).map(row => makeCard(row.setID, row.front_text, row.back_text, row.cardID));
        } catch (error) {
            console.error("Failed to get cards for set:", error);
            return CardGetStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Deletes a specific card by its card ID.
     * @param cardID - The ID of the card to delete
     * @returns Promise resolving to the status of the operation
     */
    public static async deleteCardByID(cardID: number): Promise<CardRemoveStatus> {
        try {
            if (!cardID) {
                return CardRemoveStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            const [result] = await db.connection.execute(
                "DELETE FROM card_data WHERE cardID = ?",
                [cardID]
            );

            if ((result as any).affectedRows === 0) {
                return CardRemoveStatus.CARD_DOES_NOT_EXIST;
            }

            return CardRemoveStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to delete card by ID:", error);
            return CardRemoveStatus.DATABASE_FAILURE;
        }
    }
}

