import bcrypt from 'bcrypt';
import { DatabaseService } from "../database/databaseService";
import { RowDataPacket } from "mysql2/promise";
import { User } from "./user.model";

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
}
export class AuthService{
    /**
     * Validates whether the provided password meets basic criteria.
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
