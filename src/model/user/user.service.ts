import bcrypt from 'bcrypt';
import { DatabaseService } from "../database/databaseService";
import { RowDataPacket } from "mysql2/promise";
import { User } from "./user.model";
import {banResult, LoginStatus, unbanResult, UserAction, UserActivity, UserChangeStatus} from "./user.types";
import {Moderator, Regular} from "./user.roles";

export class UserService {
    public static async unbanUser(username: string, reason: string): Promise<unbanResult> {
        try{
            const db = await DatabaseService.getConnection();
            const user = await this.getUserByUsername(username);
            // Check if the user exists
            if (user){
                //Check if the user is banned
                if (user.banned){
                    await db.connection.execute(
                        "UPDATE users SET banned = ?, ban_reason = ? WHERE username = ?",
                        [0,reason,username]
                    )
                    return unbanResult.SUCCESS;
                } else return unbanResult.USER_NOT_BANNED;
            } else return unbanResult.USER_DOES_NOT_EXIST;
        } catch(e){
            console.error(`Error unbanning user: ${(e as Error).message}`);
            return unbanResult.DATABASE_FAILURE;
        }
    }
    public static async banUser(username: string, reason: string): Promise<banResult> {
        try{
            const db = await DatabaseService.getConnection();
            const user = await this.getUserByUsername(username);
            // Check if the user exists
            if (user){
                //Check if the user is already banned
                if (!user.banned){
                    await db.connection.execute(
                        "UPDATE users SET banned = ?, ban_reason = ? WHERE username = ?",
                        [1,reason,username]
                    )
                    return banResult.SUCCESS;
                } else return banResult.USER_ALREADY_BANNED;
            } else return banResult.USER_DOES_NOT_EXIST;
        } catch(e){
            console.error(`Error banning user: ${(e as Error).message}`);
            return banResult.DATABASE_FAILURE;
        }
    }
    /**
     * Changes user details like username and email.
     * @param user - The user whose details are being changed
     * @param username - The new username
     * @param email - The new email
     * @returns Promise resolving to the status of the operation
     */
    public static async changeUserDetails(user:User, username:string, email:string): Promise<UserChangeStatus>{
        try {
            const db = await DatabaseService.getConnection();

            if (username !="" && email !="" && user){
                await db.connection.execute(
                        "UPDATE users SET username = ?, email = ? WHERE username = ?",
                        [username,email,user.username],)
                return UserChangeStatus.SUCCESS
            } else return UserChangeStatus.USER_DOES_NOT_EXIST
        } catch(e){
            console.error(`Error changing user details: ${(e as Error).message}`);
            return UserChangeStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Changes a user's password after verifying the current password.
     * @param user - The user whose password is being changed
     * @param currentPassword - The user's current password
     * @param newPassword - The new password to set
     * @returns Promise resolving to the status of the operation
     */
    public static async changeUserPassword(user:User, currentPassword: string, newPassword:string): Promise<UserChangeStatus>{
        try {
            const db = await DatabaseService.getConnection();

            const userData = await UserService.getUserByIdentifier(user.email);

            if (userData){
                const isPasswordCorrect = await bcrypt.compare(currentPassword, userData.hash);
                if(isPasswordCorrect){
                    const hash = await AuthService.hashPassword(newPassword)
                    await db.connection.execute(
                        "UPDATE users SET hash = ? WHERE username = ?",
                        [hash, userData.username],
                    )
                    return UserChangeStatus.SUCCESS
                } else return UserChangeStatus.INCORRECT_PASSWORD
            } else return UserChangeStatus.USER_DOES_NOT_EXIST;

        } catch(e){
            console.error(`Error changing user password: ${(e as Error).message}`);
            return UserChangeStatus.DATABASE_FAILURE;
        }
    }
    
    /**
     * Retrieves a user by their email address.
     * @async
     * @param email - The user's email address.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    public static async getUserByEmail(email: string): Promise<RowDataPacket | null> {
        try {
            const db = await DatabaseService.getConnection();

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT uID, username, email, hash, banned, ban_reason, role FROM users WHERE email = ?",
                [email]
            );

            return rows.length ? rows[0] : null;
        } catch (e) {
            console.error(`Error getting user by email: ${(e as Error).message}`);
            return null;
        }
    }
    
    /**
     * Retrieves a user by their username.
     * @async
     * @param username - The user's username.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    public static async getUserByUsername(username: string): Promise<RowDataPacket | null> {
        const db = await DatabaseService.getConnection();

        const [rows] = await db.connection.execute<RowDataPacket[]>(
            "SELECT uID, username, email, hash, banned, ban_reason, role FROM users WHERE username = ?",
            [username]
        );

        return rows.length ? rows[0] : null;
    }
    
    /**
     * Retrieves a user by their email or username (identifier).
     * @async
     * @param identifier - The user's username, email, or uID.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    public static async getUserByIdentifier(identifier: string | number): Promise<RowDataPacket | null> {
        try {
            const db = await DatabaseService.getConnection();
            
            if (typeof identifier === 'number') {
                const [rows] = await db.connection.execute<RowDataPacket[]>(
                    "SELECT uID, username, email, hash, banned, ban_reason, role FROM users WHERE uID = ?",
                    [identifier]
                );
                return rows.length ? rows[0] : null;
            }
            
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT uID, username, email, hash, banned, ban_reason, role FROM users WHERE username = ? OR email = ?",
                [identifier, identifier]
            );
            
            return rows.length ? rows[0] : null;
        } catch (error) {
            console.error(`Error getting user by identifier: ${error instanceof Error ? error.message : error}`);
            return null;
        }
    }
    
    /**
     * Retrieves the user ID (uID) based on the provided identifier.
     * @async
     * @param {string | number} identifier - The user's username, email, or uID.
     * @returns {Promise<number>} A promise resolving to the user ID or -1 if not found.
     */
    public static async getIDOfUser(identifier: string | number): Promise<number> {
        try {
            const db = await DatabaseService.getConnection();

            if (typeof identifier === 'number') {
                const [rows] = await db.connection.execute<RowDataPacket[]>(
                    "SELECT uID FROM users WHERE uID = ?",
                    [identifier]
                );
                return rows.length > 0 ? rows[0].uID as number : -1;
            }
            
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT uID FROM users WHERE username = ? OR email = ?",
                [identifier, identifier]
            );

            return rows.length > 0 ? rows[0].uID as number : -1;
        } catch (error) {
            console.error(`Error fetching user ID: ${(error as Error).message}`);
            return -1;
        }
    }

    /**
     * Checks if a user exists in the database.
     * @async
     * @param {string | number} identifier - The user's username, email, or uID.
     * @returns {Promise<boolean>} A promise resolving to true if the user exists, false otherwise.
     */
    public static async doesUserExist(identifier: string | number): Promise<boolean> {
        try {
            const db = await DatabaseService.getConnection();

            const query = "SELECT 1 FROM users WHERE username = ? OR email = ? OR uID = ?";
            const params = [identifier, identifier, identifier];

            const [rows] = await db.connection.execute<RowDataPacket[]>(query, params);

            return rows.length > 0;
        } catch (e) {
            console.error(`Error checking if user exists: ${(e as Error).message}`);
            return false;
        }
    }

    /**
     * Logs a user action into the database.
     * @async
     * @param {User} user - The user performing the action.
     * @param {UserAction} action - The action being logged.
     * @returns {Promise<boolean>} - Resolves to true if the action was logged successfully, false otherwise.
     */
    public static async logUserAction(user: User, action: UserAction): Promise<boolean> {
        try {
            const db = await DatabaseService.getConnection();
            const uID = await this.getIDOfUser(user.username);

            if (uID === -1) {
                console.error("Invalid user ID, cannot log activity.");
                return false;
            }

            await db.connection.execute(
                "INSERT INTO user_activity (uID, action) VALUES (?, ?)",
                [uID, action]
            );
            return true;
        } catch (error) {
            console.error(`Error logging user action: ${(error as Error).message}`);
            return false;
        }
    }

    /**
     * Retrieves all user activity for a given user (all-time).
     * @async
     * @param {User} user - The user whose activity is being retrieved.
     * @returns {Promise<UserActivity[] | null>} - Resolves to an array of user activities or null if an error occurs.
     */
    public static async getUserActivityAllTime(user: User): Promise<UserActivity[] | null> {
        try {
            const db = await DatabaseService.getConnection();
            const uID = await this.getIDOfUser(user.username);

            if (uID === -1) {
                console.error("Invalid user ID, cannot fetch activity.");
                return null;
            }

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT activityID, uID, action, time FROM user_activity WHERE uID = ? ORDER BY time DESC",
                [uID]
            );

            return rows.length ? (rows as UserActivity[]) : [];
        } catch (error) {
            console.error(`Error fetching user activity: ${(error as Error).message}`);
            return null;
        }
    }

    /**
     * Retrieves user activity for the last 7 days.
     * @async
     * @param {User} user - The user whose activity is being retrieved.
     * @returns {Promise<UserActivity[] | null>} - Resolves to an array of user activities or null if an error occurs.
     */
    public static async getUserActivityLast7Days(user: User): Promise<UserActivity[] | null> {
        try {
            const db = await DatabaseService.getConnection();
            const uID = await this.getIDOfUser(user.username);

            if (uID === -1) {
                console.error("Invalid user ID, cannot fetch activity.");
                return null;
            }

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                `SELECT activityID, uID, action, time 
                 FROM user_activity 
                 WHERE uID = ? AND time >= NOW() - INTERVAL 7 DAY 
                 ORDER BY time DESC`,
                [uID]
            );

            return rows.length ? (rows as UserActivity[]) : [];
        } catch (error) {
            console.error(`Error fetching user activity (last 7 days): ${(error as Error).message}`);
            return null;
        }
    }
    
    /**
     * Retrieves all users with the role REGULAR.
     * @async
     * @returns {Promise<{ user: Regular, joinDate: string, banned: boolean, banReason: string }[]>} A promise resolving to an array of regular users.
     */
    public static async getRegularUsers(): Promise<{ user: Regular, joinDate: string, banned: boolean, banReason: string }[]> {
        const db = await DatabaseService.getConnection();

        const [rows] = await db.connection.execute<RowDataPacket[]>(
            "SELECT username, email, join_date, banned, ban_reason FROM users WHERE role = 'REGULAR'"
        );

        return rows.map(row => ({
            user: new Regular(row.username, row.email),
            joinDate: row.join_date,
            banned: row.banned,
            banReason: row.ban_reason
        }));
    }

    /**
     * Retrieves all users with the role MODERATOR.
     * @async
     * @returns {Promise<Moderator[]>} A promise resolving to an array of moderator users.
     */
    public static async getModeratorUsers(): Promise<Moderator[]> {
        const db = await DatabaseService.getConnection();

        const [rows] = await db.connection.execute<RowDataPacket[]>(
            "SELECT username, email, role FROM users WHERE role = 'MODERATOR'"
        );

        return rows.map(row => new Moderator(row.username, row.email));
    }
}

export class AuthService{
    /**
     * Validates whether the provided password meets criteria.
     * @param password - The password to validate.
     * @returns {boolean} True if the password is valid, false otherwise.
     */
    public static isValidPassword(password: string): boolean {
        const regex = /^(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{8,}$/;
        return regex.test(password);
    }

    /**
     * Hashes a password using bcrypt with a salt factor of 12.
     * @async
     * @param {string} password - The plaintext password to hash.
     * @returns {Promise<string>} The hashed password.
     */
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }
}
