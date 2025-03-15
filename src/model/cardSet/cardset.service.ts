import {DatabaseService} from "../database/databaseService";
import {RowDataPacket} from "mysql2/promise";
import {UserService} from "../user/user.service";
import {User} from "../user/user.model";
import {CardSet, Category} from "./cardset.model";
import {CardSetAddStatus, CardSetEditStatus, CardSetGetStatus, CardSetRemoveStatus, CardSetReportStatus, CardSetShareStatus} from "./cardset.types";

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

            // Format subCategory to have spaces between words for proper display on front end.
            card_set.subCategory = card_set.subCategory.replace(/([a-z])([A-Z])/g, '$1 $2');

            const db = await DatabaseService.getConnection();
            const ownerID = await UserService.getIDOfUser(user.username);

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
            const ownerID = await UserService.getIDOfUser(user.username);
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
    static async getSet(setID: number): Promise<CardSet | CardSetGetStatus> {
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
            console.error("Failed to get card set" + setID + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }

    static async getSharedSets(user: User): Promise<CardSet[] | CardSetGetStatus> {
        try{
            const db = await DatabaseService.getConnection();
            const userID = await UserService.getIDOfUser(user.username);
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT setID FROM shared_sets WHERE uID = ?",
                [userID],
            );

            let sets: CardSet[] = [];
            if(rows.length === 0) return CardSetGetStatus.USER_HAS_NO_SETS;
            for (const row of rows) {
                if(row.setID){
                    let res = await this.getSet(row.setID);
                    if(res !== CardSetGetStatus.USER_HAS_NO_SETS && res !== CardSetGetStatus.SET_DOES_NOT_EXIST  && res !== CardSetGetStatus.DATABASE_FAILURE){
                        sets.push(res);
                    }
                }
            }
            return sets;
        } catch(error){
            console.error("Failed to get shared card sets with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }
    
    static async shareSet(user: User, shareWith: string, setID: number): Promise<CardSetShareStatus> {
        try{
            const db = await DatabaseService.getConnection();
            
            // Check if user exists
            const userExists = await UserService.doesUserExist(shareWith);
            if(!userExists) return CardSetShareStatus.USER_DOES_NOT_EXIST;
            
            // Check if set exists
            const set = await this.getSet(setID);
            if(set === CardSetGetStatus.SET_DOES_NOT_EXIST || set === CardSetGetStatus.DATABASE_FAILURE) 
                return CardSetShareStatus.SET_DOES_NOT_EXIST;
            
            // Get user ID to share with
            const shareWithID = await UserService.getIDOfUser(shareWith);
            if(shareWithID === -1) return CardSetShareStatus.USER_DOES_NOT_EXIST;
            
            // Check if already shared
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM shared_sets WHERE uID = ? AND setID = ?",
                [shareWithID, setID]
            );
            if(rows.length > 0) return CardSetShareStatus.ALREADY_SHARED;

            // Share the set
            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO shared_sets (uID, setID) VALUES (?, ?)",
                [shareWithID, setID]
            );
            return CardSetShareStatus.SUCCESS;
        } catch(error){
            console.error("Failed to share card set with error: ", error);
            return CardSetShareStatus.DATABASE_FAILURE;
        }
    }

    static async editSet(user:User, set: CardSet): Promise<CardSetEditStatus> {
        try{
            const db = await DatabaseService.getConnection();
            if(!set.setName || !set.category || !set.subCategory || !set.description || !set.setID){
                return CardSetEditStatus.MISSING_INFORMATION;
            }
            // Check if set exists
            const setExists = await this.getSet(set.setID);
            if(setExists === CardSetGetStatus.SET_DOES_NOT_EXIST || setExists === CardSetGetStatus.DATABASE_FAILURE){
                return CardSetEditStatus.SET_DOES_NOT_EXIST;
            }

            // Check if name is already used by another one of the users sets
            const ownerID = await UserService.getIDOfUser(user.username);
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE set_name = ? AND ownerID = ? AND setID != ?",
                [set.setName, ownerID, set.setID]
            );
            if(rows.length > 0) return CardSetEditStatus.NAME_USED;
            
            // Edit the set
            await db.connection.execute<RowDataPacket[]>(
                "UPDATE card_sets SET set_name = ?, category = ?, sub_category = ?, description = ? WHERE setID = ?",
                [set.setName, set.category, set.subCategory, set.description, set.setID]
            );

            return CardSetEditStatus.SUCCESS;
        } catch (error){
            console.error("Failed to edit set with error: ", error);
            return CardSetEditStatus.DATABASE_FAILURE;
        }
    }

    static async getSharedSet(user: User, setID: number): Promise<CardSet | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const userID = await UserService.getIDOfUser(user.username);
            
            // Check if the set is shared with the user
            const [sharedRows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM shared_sets WHERE uID = ? AND setID = ? LIMIT 1",
                [userID, setID]
            );
            
            if (sharedRows.length === 0) return CardSetGetStatus.SET_DOES_NOT_EXIST;
            
            // Get the set details
            const set = await this.getSet(setID);
            if (set === CardSetGetStatus.SET_DOES_NOT_EXIST || set === CardSetGetStatus.DATABASE_FAILURE) {
                return CardSetGetStatus.SET_DOES_NOT_EXIST;
            }
            
            return set;
        } catch (error) {
            console.error("Failed to get shared set with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }

    static async removeSharedSet(user: User, setID: number): Promise<CardSetRemoveStatus> {
        try {
            if (setID <= 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            const db = await DatabaseService.getConnection();
            const userID = await UserService.getIDOfUser(user.username);
            
            // Check if the set is shared with the user
            const [shareRows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM shared_sets WHERE uID = ? AND setID = ? LIMIT 1",
                [userID, setID]
            );
            
            if (shareRows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            // Remove the shared set entry
            await db.connection.execute<RowDataPacket[]>(
                "DELETE FROM shared_sets WHERE uID = ? AND setID = ?",
                [userID, setID]
            );
            
            return CardSetRemoveStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to remove shared set:", error);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }

}
