import {DatabaseService} from "../database/databaseService";
import {RowDataPacket} from "mysql2/promise";
import {UserService} from "../user/user.service";
import {User} from "../user/user.model";
import {CardSet, Category, makeCardSet, Report} from "./cardset.model";
import {CardSetAddStatus, CardSetEditStatus, CardSetGetStatus, CardSetRemoveStatus, CardSetReportStatus, CardSetShareStatus} from "./cardset.types";

export class CardSetService {
    static async disapproveSet(setID: number): Promise<CardSetRemoveStatus> {
        try{
            const db = await DatabaseService.getConnection();
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE setID = ? LIMIT 1",
                [setID]
            );
            if(rows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            await db.connection.execute<RowDataPacket[]>(
                "UPDATE card_sets SET approved = 0, public_set = 0 WHERE setID = ?",
                [setID]
            );
            return CardSetRemoveStatus.SUCCESS;
        } catch(error){
            console.error(`Failed to disapprove set with error: ${error instanceof Error ? error.message : error}`);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }
    static async approveSet(setID: number): Promise<CardSetRemoveStatus> {
        try{
            const db = await DatabaseService.getConnection();
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE setID = ? LIMIT 1",
                [setID]
            );
            if(rows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            await db.connection.execute<RowDataPacket[]>(
                "UPDATE card_sets SET approved = 1 WHERE setID = ?",
                [setID]
            );
            return CardSetRemoveStatus.SUCCESS;
        } catch(error){
            console.error(`Failed to approve set with error: ${error instanceof Error ? error.message : error}`);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }
    static async dismissReport(reportID: number): Promise<CardSetRemoveStatus> {
        try{
            const db = await DatabaseService.getConnection();
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM reports WHERE reportID = ? LIMIT 1",
                [reportID]
            );
            if(rows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            await db.connection.execute<RowDataPacket[]>(
                "DELETE FROM reports WHERE reportID = ?",
                [reportID]
            );
            return CardSetRemoveStatus.SUCCESS;
        } catch(error){
            console.error(`Failed to dismiss report with error: ${error instanceof Error ? error.message : error}`);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }
    static async getUnapprovedSets(): Promise<CardSet[] | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT ownerID, set_name, category, sub_category, description, setID, public_set, approved FROM card_sets WHERE approved = 0 AND public_set = 1"
            );
            if (!rows || rows.length === 0) return CardSetGetStatus.USER_HAS_NO_SETS;

            const sets = rows.map(row => makeCardSet(
                row.ownerID,
                row.set_name,
                row.category as Category,
                row.sub_category,
                row.description,
                row.setID,
                row.public_set,
                row.approved
            ));
            return sets;
        } catch (error) {
            console.error("Failed to get unapproved card sets with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }
    
    /**
     * Retrieves all reported card sets.
     * @returns Promise resolving to an array of reported card sets or a status code
     */
    static async getReportedSets(): Promise<{ cardSet: CardSet, reason: string, reporterID: number, reportID: number }[] | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const query = `
                SELECT cs.ownerID, cs.set_name, cs.category, cs.sub_category, cs.description, cs.setID, cs.public_set, cs.approved, r.reason, r.reportID, r.reporterID 
                FROM card_sets cs 
                INNER JOIN reports r ON cs.setID = r.setID
            `;
            const [rows] = await db.connection.execute<RowDataPacket[]>(query);

            if (!rows || rows.length === 0) {
                return CardSetGetStatus.USER_HAS_NO_SETS;
            }

            const reportedSets = rows.map(row => ({
                cardSet: makeCardSet(
                    row.ownerID,
                    row.set_name,
                    row.category as Category,
                    row.sub_category,
                    row.description,
                    row.setID,
                    row.public_set,
                    row.approved
                ),
                reason: row.reason,
                reporterID: row.reporterID,
                reportID: row.reportID
            }));

            return reportedSets;
        } catch (error) {
            console.error("Failed to get reported card sets with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }
    /**
     * Adds a new card set for a given user.
     * @param user - The user adding the set
     * @param card_set - The card set to add, containing setName, category, and description
     * @returns Promise resolving to the status of the operation
     */
    static async addSet(user: User, card_set: CardSet): Promise<CardSetAddStatus> {
        try {
            if (!card_set.setName || !card_set.category || !card_set.subCategory || !card_set.description || card_set.publicSet === undefined) {
                return CardSetAddStatus.MISSING_INFORMATION;
            }

            card_set.subCategory = card_set.subCategory.replace(/([a-z])([A-Z])/g, '$1 $2');

            const db = await DatabaseService.getConnection();
            const ownerID = await UserService.getIDOfUser(user.username);

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE set_name = ? AND ownerID = ? LIMIT 1",
                [card_set.setName, ownerID]
            );
            if (rows.length > 0) return CardSetAddStatus.NAME_USED;

            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO card_sets (ownerID, set_name, category, sub_category, description, public_set) VALUES (?, ?, ?, ?, ?, ?)",
                [ownerID, card_set.setName, card_set.category, card_set.subCategory, card_set.description, card_set.publicSet]
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
     */
    static async reportSet(report: Report ): Promise<CardSetReportStatus> {
        try {
            const db = await DatabaseService.getConnection();
            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO reports (setID, reason, reporterID) VALUES (?, ?, ?)",
                [report.setID, report.reason || "No reason provided", report.reporterID ]
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
     * @param setType - The type of sets to retrieve (e.g., 'shared')
     * @returns Promise resolving to an array of card sets or a status code
     */
    static async getAllSets(user: User, setType: string): Promise<CardSet[] | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const ownerID = await UserService.getIDOfUser(user.username);
            let query = "SELECT ownerID, set_name, category, sub_category, description, setID, public_set, approved FROM card_sets WHERE ownerID = ?";
            let params = [ownerID];

            if (setType === 'shared') {
                query = `SELECT cs.ownerID, cs.set_name, cs.category, cs.sub_category, cs.description, cs.setID, cs.public_set, cs.approved 
                         FROM card_sets cs 
                         INNER JOIN shared_sets ss ON cs.setID = ss.setID 
                         WHERE ss.uID = ?`;
                params = [ownerID];
            }

            const [rows] = await db.connection.execute<RowDataPacket[]>(query, params);

            if (!rows || rows.length === 0) {
                return CardSetGetStatus.USER_HAS_NO_SETS;
            }

            const sets = rows.map(row => makeCardSet(
                row.ownerID,
                row.set_name,
                row.category as Category,
                row.sub_category,
                row.description,
                row.setID,
                row.public_set,
                row.approved
            ));
            return sets;
        } catch (error) {
            console.error("Failed to get card sets for user " + user.username + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Retrieves a specific card set by its ID.
     * @param user - The user requesting the shared set
     * @param setID - The ID of the shared set
     * @param setType - The type of sets to retrieve (e.g., 'shared')
     * @returns Promise resolving to the card set or a status code
     */
    static async getSet(user: User, setID: number, setType: string): Promise<CardSet | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();
            const userID = await UserService.getIDOfUser(user.username);
            let query = "SELECT ownerID, set_name, category, sub_category, description, setID, public_set, approved FROM card_sets WHERE setID = ?";
            let params = [setID];

            if (setType === 'shared') {
                query = `SELECT cs.ownerID, cs.set_name, cs.category, cs.sub_category, cs.description, cs.setID, cs.public_set, cs.approved 
                         FROM card_sets cs 
                         INNER JOIN shared_sets ss ON cs.setID = ss.setID 
                         WHERE ss.uID = ? AND cs.setID = ? 
                         LIMIT 1`;
                params = [userID, setID];
            }

            const [rows] = await db.connection.execute<RowDataPacket[]>(query, params);
            if (rows.length === 0) return CardSetGetStatus.SET_DOES_NOT_EXIST;

            const row = rows[0];
            return makeCardSet(
                row.ownerID,
                row.set_name,
                row.category as Category,
                row.sub_category,
                row.description,
                row.setID,
                row.public_set,
                row.approved
            );
        } catch (error) {
            console.error("Failed to get card set " + setID + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Shares a card set with another user.
     * @param user - The user sharing the set
     * @param shareWith - Username of the user to share with
     * @param setID - The ID of the set to share
     * @returns Promise resolving to the status of the operation
     */
    static async shareSet(user: User, shareWith: string, setID: number): Promise<CardSetShareStatus> {
        try{
            const db = await DatabaseService.getConnection();
            
            const userExists = await UserService.doesUserExist(shareWith);
            if(!userExists) return CardSetShareStatus.USER_DOES_NOT_EXIST;
            
            const userID = await UserService.getIDOfUser(user.username);
            const [ownerRows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE setID = ? AND ownerID = ? LIMIT 1",
                [setID, userID]
            );
            
            if(ownerRows.length === 0) return CardSetShareStatus.SET_DOES_NOT_EXIST;
            
            const shareWithID = await UserService.getIDOfUser(shareWith);
            if(shareWithID === -1) return CardSetShareStatus.USER_DOES_NOT_EXIST;
            
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM shared_sets WHERE uID = ? AND setID = ?",
                [shareWithID, setID]
            );
            if(rows.length > 0) return CardSetShareStatus.ALREADY_SHARED;

            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO shared_sets (uID, setID) VALUES (?, ?)",
                [shareWithID, setID]
            );
            return CardSetShareStatus.SUCCESS;
        } catch(error){
            console.error(`Failed to share card set with error: ${error instanceof Error ? error.message : error}`);
            return CardSetShareStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Edits an existing card set's details.
     * @param user - The user editing the set
     * @param set - The updated card set details
     * @returns Promise resolving to the status of the operation
     */
    static async editSet(user:User, set: CardSet): Promise<CardSetEditStatus> {
        try{
            const db = await DatabaseService.getConnection();
            if(!set.setName || !set.category || !set.subCategory || !set.description || !set.setID){
                return CardSetEditStatus.MISSING_INFORMATION;
            }
            
            const setExists = await this.getSet(user, set.setID, 'owned');
            if(setExists === CardSetGetStatus.SET_DOES_NOT_EXIST || setExists === CardSetGetStatus.DATABASE_FAILURE){
                return CardSetEditStatus.SET_DOES_NOT_EXIST;
            }

            const ownerID = await UserService.getIDOfUser(user.username);
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE set_name = ? AND ownerID = ? AND setID != ?",
                [set.setName, ownerID, set.setID]
            );
            if(rows.length > 0) return CardSetEditStatus.NAME_USED;
            
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

    /**
     * Removes a shared set from a user's access.
     * @param user - The user removing access to the shared set
     * @param setID - The ID of the shared set to remove
     * @returns Promise resolving to the status of the operation
     */
    static async removeSharedSet(user: User, setID: number): Promise<CardSetRemoveStatus> {
        try {
            if (setID <= 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            const db = await DatabaseService.getConnection();
            const userID = await UserService.getIDOfUser(user.username);
            
            const [shareRows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM shared_sets WHERE uID = ? AND setID = ? LIMIT 1",
                [userID, setID]
            );
            
            if (shareRows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            await db.connection.execute<RowDataPacket[]>(
                "DELETE FROM shared_sets WHERE uID = ? AND setID = ?",
                [userID, setID]
            );
            
            return CardSetRemoveStatus.SUCCESS;
        } catch (error) {
            console.error(`Failed to remove shared set: ${error instanceof Error ? error.message : error}`);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }
}
