import { DatabaseService } from "../database/databaseService";
import { Card, makeCard } from "./card.model";
import { CardAddStatus, CardRemoveStatus, CardGetStatus, CardEditStatus } from "./card.types";

export class CardService {
    /*export enum CardEditStatus {
    DATABASE_FAILURE,    // Error occurred while interacting with the database.
    SET_DOES_NOT_EXIST, // The requested card set does not exist.
    CARD_DOES_NOT_EXIST, // The requested card does not exist.
    MISSING_INFORMATION, // Required card details are missing.
    SUCCESS              // Card was successfully added.
    }*/

    public static async editCardInSet(card: Card): Promise<CardEditStatus>{
        try{
            // Validate required fields
            if (!card.setID || !card.front_text || !card.back_text || !card.cardID) {
                return CardEditStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            // Check if the set exists
            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [card.setID]
            );

            if(!setRows || (setRows as any[]).length === 0){
                return CardEditStatus.SET_DOES_NOT_EXIST;
            }

            // Check if the card exists
            const [cardRows] = await db.connection.execute(
                "SELECT cardID FROM card_data WHERE cardID = ?",
                [card.cardID]
            );

            if(!cardRows || (cardRows as any[]).length === 0){
                return CardEditStatus.CARD_DOES_NOT_EXIST;
            }

            // Update the card
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
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     * @throws Will return MISSING_INFORMATION if required fields are missing
     * @throws Will return SET_DOES_NOT_EXIST if the target set doesn't exist
     */
    public static async addCardToSet(card: Card): Promise<CardAddStatus> {
        try {
            // Validate required fields
            if (!card.setID || !card.front_text || !card.back_text) {
                return CardAddStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            // Check if the set exists
            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [card.setID]
            );

            if (!setRows || (setRows as any[]).length === 0) {
                return CardAddStatus.SET_DOES_NOT_EXIST;
            }

            // Insert the new card
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
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     * @throws Will return MISSING_INFORMATION if cardID or setID is missing
     * @throws Will return CARD_DOES_NOT_EXIST if the card doesn't exist
     * @throws Will return SET_DOES_NOT_EXIST if the set doesn't exist
     */
    public static async deleteCardFromSet(cardID: number, setID: number): Promise<CardRemoveStatus> {
        try {
            // Validate required fields
            if (!cardID || !setID) {
                return CardRemoveStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            // Check if the set exists
            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [setID]
            );

            if (!setRows || (setRows as any[]).length === 0) {
                return CardRemoveStatus.SET_DOES_NOT_EXIST;
            }

            // Delete the card by ID and setID
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
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     * @throws Will return SET_DOES_NOT_EXIST if the target set doesn't exist
     * @throws Will return SET_HAS_NO_CARDS if the set exists but has no cards
     */
    public static async getCards(setID: string): Promise<Card[] | CardGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            // Check if the set exists
            const [setRows] = await db.connection.execute(
                "SELECT setID FROM card_sets WHERE setID = ?",
                [setID]
            );

            if (!setRows || (setRows as any[]).length === 0) {
                return CardGetStatus.SET_DOES_NOT_EXIST;
            }

            // Get all cards for the set
            const [cardRows] = await db.connection.execute(
                "SELECT * FROM card_data WHERE setID = ?",
                [setID]
            );

            if (!cardRows || (cardRows as any[]).length === 0) {
                return CardGetStatus.SET_HAS_NO_CARDS;
            }

            // Convert database rows to Card objects
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
 * @throws Will return DATABASE_FAILURE if there's an error with the database operation
 * @throws Will return MISSING_INFORMATION if cardID is missing
 * @throws Will return CARD_DOES_NOT_EXIST if the card doesn't exist
 */
public static async deleteCardByID(cardID: number): Promise<CardRemoveStatus> {
    try {
        // Validate required fields
        if (!cardID) {
            return CardRemoveStatus.MISSING_INFORMATION;
        }

        const db = await DatabaseService.getConnection();

        // Delete the card by ID
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

