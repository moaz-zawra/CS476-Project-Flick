import bcrypt from 'bcrypt';
import { DatabaseService } from "../database/databaseService";
import { RowDataPacket } from "mysql2/promise";
import { User } from "./user.model";
import {UserAction, UserActivity} from "./user.types";
import {Moderator, Regular} from "./user.roles";

export class UserService {
    /**
     * Retrieves a user by their email address.
     * @async
     * @param email - The user's email address.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    public static async getUserByEmail(email: string): Promise<RowDataPacket | null> {
        const db = await DatabaseService.getConnection();

        const [rows] = await db.connection.execute<RowDataPacket[]>(
            "SELECT username, email, hash, role FROM users WHERE email = ?",
            [email]
        );

        return rows.length ? rows[0] : null;
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
            "SELECT username, email, hash, role FROM users WHERE username = ?",
            [username]
        );

        return rows.length ? rows[0] : null;
    }
    /**
     * Retrieves a user by their email or username (identifier).
     * @async
     * @param identifier - The user's username or email.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    public static async getUserByIdentifier(identifier: string): Promise<RowDataPacket | null> {
        const db = await DatabaseService.getConnection();

        const [rows] = await db.connection.execute<RowDataPacket[]>(
            "SELECT username, email, hash, role FROM users WHERE username = ? OR email = ?",
            [identifier, identifier]
        );

        return rows.length ? rows[0] : null;
    }
    /**
     * Retrieves the user ID (uID) based on the provided username.
     * @async
     * @param {User} user - The user object containing the username.
     * @returns {Promise<number>} A promise resolving to the user ID or -1 if not found.
     */
    public static async getIDOfUser(user: User): Promise<number> {
        if (!user?.username) {
            console.error("Invalid user object provided.");
            return -1;
        }

        try {
            const db = await DatabaseService.getConnection();

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT uID FROM users WHERE username = ?",
                [user.username]
            );

            return rows.length > 0 ? rows[0].uID as number : -1;
        } catch (error) {
            console.error(`Error fetching user ID: ${(error as Error).message}`);
            return -1;
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
            const uID = await this.getIDOfUser(user);

            if (uID === -1) {
                console.error("Invalid user ID, cannot log activity.");
                return false;
            }

            await db.connection.execute(
                "INSERT INTO user_activity (uID, action, timestamp) VALUES (?, ?, NOW())",
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
            const uID = await this.getIDOfUser(user);

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
            const uID = await this.getIDOfUser(user);

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
     * @returns {Promise<Regular[]>} A promise resolving to an array of regular users.
     */
    public static async getRegularUsers(): Promise<Regular[]> {
        const db = await DatabaseService.getConnection();

        const [rows] = await db.connection.execute<RowDataPacket[]>(
            "SELECT username, email FROM users WHERE role = 'REGULAR'"
        );

        // Map RowDataPacket to Regular instances
        return rows.map(row => new Regular(row.username, row.email));
    }


    /**
     * Retrieves all users with the role MODERATOR.
     * @async
     * @returns {Promise<RowDataPacket[]>} A promise resolving to an array of moderator users.
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
     * @see {@link https://en.wikipedia.org/wiki/Bcrypt}
     */
    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }
}
