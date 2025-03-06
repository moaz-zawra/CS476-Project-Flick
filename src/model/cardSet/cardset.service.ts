import { DatabaseService } from "../database/databaseService";
import { RowDataPacket } from "mysql2/promise";
import { UserService } from "../user/user.service";
import { User } from "../user/user.model";
import { CardSet, Category } from "./cardset.model";
import { CardSetAddStatus, CardSetRemoveStatus, CardSetReportStatus, CardSetGetStatus } from "./cardset.types";

export class CardSetService {
    /**
     * Adds a new card set for a given user.
     * @param user - The user adding the set
     * @param card_set - The card set to add, containing setName, category, and description
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static async addSet(user: User, card_set: CardSet): Promise<CardSetAddStatus> {
        try {
            if (!card_set.setName || !card_set.category || !card_set.subCategory || !card_set.description) {
                return CardSetAddStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();
            const ownerID = await UserService.getIDOfUser(user);

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE set_name = ? AND ownerID = ? LIMIT 1",
                [card_set.setName, ownerID]
            );
            if (rows.length > 0) return CardSetAddStatus.NAME_USED;

            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO card_sets (ownerID, set_name, category, sub_category, description) VALUES (?, ?, ?, ?, ?)",
                [ownerID, card_set.setName, card_set.category, card_set.subCategory, card_set.description]
            );
            return CardSetAddStatus.SUCCESS;
        } catch (error) {
            console.error("Card set failed to be entered into DB:", error);
            return CardSetAddStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Deletes a card set by its ID.
     * @param setID - The ID of the set to delete
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static async deleteSet(setID: number): Promise<CardSetRemoveStatus> {
        try {
            if (setID <= 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            const db = await DatabaseService.getConnection();
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE setID = ? LIMIT 1",
                [setID]
            );
            if (rows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            await db.connection.execute<RowDataPacket[]>(
                "DELETE FROM card_sets WHERE setID = ?",
                [setID]
            );
            return CardSetRemoveStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to delete card set:", error);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Reports a card set for inappropriate content or other issues.
     * @param report - Object containing setID and reason for the report
     * @returns Promise resolving to the status of the operation
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static async reportSet(report: { setID: number; reason: string }): Promise<CardSetReportStatus> {
        try {
            const db = await DatabaseService.getConnection();
            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO reports (setID, reason) VALUES (?, ?)",
                [report.setID, report.reason || "No reason provided"]
            );
            return CardSetReportStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to report set:", error);
            return CardSetReportStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Retrieves all card sets for a given user.
     * @param user - The user whose sets to retrieve
     * @returns Promise resolving to an array of card sets or a status code
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static async getAllSets(user: User): Promise<CardSet[] | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const ownerID = await UserService.getIDOfUser(user);
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT ownerID, set_name, category, sub_category, description, setID FROM card_sets WHERE ownerID = ?",
                [ownerID]
            );

            if (!rows || rows.length === 0) {
                return CardSetGetStatus.USER_HAS_NO_SETS;
            }

            const sets = rows.map(row => ({
                ownerID: row.ownerID,
                setName: row.set_name,
                category: row.category as Category,
                subCategory: row.sub_category,
                description: row.description,
                setID: row.setID
            }));
            console.log("Sets: ", sets);
            return sets;
        } catch (error) {
            console.error("Failed to get card sets for user " + user.username + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Retrieves a specific card set by its ID.
     * @param setID - The ID of the set to retrieve
     * @param user - Optional user parameter for logging purposes
     * @returns Promise resolving to the card set or a status code
     * @throws Will return DATABASE_FAILURE if there's an error with the database operation
     */
    static async getSet(setID: number, user?: User): Promise<CardSet | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT ownerID, set_name, category, sub_category, description, setID FROM card_sets WHERE setID = ?",
                [setID]
            );
            if (rows.length === 0) return CardSetGetStatus.SET_DOES_NOT_EXIST;

            const row = rows[0];
            return {
                ownerID: row.ownerID,
                setName: row.set_name,
                category: row.category as Category,
                subCategory: row.sub_category,
                description: row.description,
                setID: row.setID
            };
        } catch (error) {
            console.error("Failed to get card set" + setID + " for user " + (user?.username || "unknown") + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }
}
