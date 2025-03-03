import bcrypt = require('bcrypt');
import { DatabaseService } from "./dbConnect";
import {
    CardSet,
    Card,
    Report,
    Role,
    CardAddStatus,
    CardGetStatus,
    CardRemoveStatus,
    CardSetAddStatus,
    CardSetGetStatus,
    CardSetRemoveStatus,
    CardSetReportStatus,
    LoginStatus,
    ModBanStatus,
    ModUnBanStatus,
    RegisterStatus, makeCardSet, makeCard
} from "../types/types";
import { RowDataPacket } from "mysql2/promise";
import {parseStringToArray} from "./utility";

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

/**
 * Represents a user account in the system.
 */
export interface User {
    readonly username: string;
    readonly email: string;
    readonly role: Role;
}

/**
 * Abstract class representing a user factory for authentication-related actions.
 */
abstract class UserFactory {
    /**
     * Logs in a user using an identifier (email or username) and password.
     * @async
     * @param identifier - The username or email of the user.
     * @param password - The user's password.
     * @returns {Promise<User | LoginStatus>} A promise resolving to a User instance or a LoginStatus on failure.
     */
    public abstract login(identifier: string, password: string): Promise<User | LoginStatus>;
}


/**
 * Class responsible for user creation and authentication.
 */
export class UserCreator extends UserFactory {
    /**
     * Registers a new user in the system.
     * @async
     * @param username - The desired username for the new user.
     * @param email - The email address of the new user.
     * @param password - The password for the new user.
     * @param cpassword - The confirmation password to verify correctness.
     * @returns {Promise<RegisterStatus>} A promise resolving to a RegisterStatus indicating success or failure.
     */
    public async registerUser(username: string, email: string, password: string, cpassword: string): Promise<RegisterStatus> {
        try {
            const db = await DatabaseService.getConnection();


            const emailExists = await UserService.getUserByEmail(email);
            if (emailExists) return RegisterStatus.EMAIL_USED;

            const usernameExists = await UserService.getUserByUsername(username);
            if (usernameExists) return RegisterStatus.USERNAME_USED;

            if (!UserService.isValidPassword(password)) return RegisterStatus.BAD_PASSWORD;
            if (password !== cpassword) return RegisterStatus.PASSWORD_MISMATCH;

            await db.connection.execute(
                "INSERT INTO users (username, email, hash, role) VALUES (?, ?, ?, ?);",
                [username, email, await UserService.hashPassword(password), "REGULAR"]
            );
            return RegisterStatus.SUCCESS;
        } catch (error) {
            console.error("Error:", error);
            return RegisterStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Logs in a user by validating their identifier (email or username) and password.
     * @async
     * @param identifier - The username or email of the user.
     * @param password - The user's password.
     * @returns {Promise<User | LoginStatus>} A promise resolving to a User instance or a LoginStatus on failure.
     */
    public async login(identifier: string, password: string): Promise<User | LoginStatus> {
        try {
            const db = await DatabaseService.getConnection();

            const userData = await UserService.getUserByIdentifier(identifier);
            if (!userData) return LoginStatus.USER_DOES_NOT_EXIST;

            const isPasswordCorrect = await bcrypt.compare(password, userData.hash);
            if (!isPasswordCorrect) return LoginStatus.WRONG_PASSWORD;

            switch (userData.role) {
                case "REGULAR": {
                    return new Regular(userData.username, userData.email);
                }
                case "MODERATOR": {
                    return new Moderator(userData.username, userData.email);
                }
                case "ADMINISTRATOR": {
                    return new Administrator(userData.username, userData.email);
                }
                default: {
                    console.error("Invalid role: " + userData.role);
                    return LoginStatus.OTHER;
                }
            }
        } catch (error) {
            console.error(`Login failed: ${(error as Error).message}`);
            return LoginStatus.DATABASE_FAILURE;
        }
    }
}


/**
 * Represents a regular user with the ability to manage card sets.
 */
export class Regular implements User {
    readonly username: string;
    readonly email: string;
    readonly role: Role = Role.REGULAR;

    /**
     * Constructs a new Regular user.
     * @param username - The username of the user.
     * @param email - The email of the user.
     */
    constructor(username: string, email: string) {
        this.username = username;
        this.email = email;
    }

    /**
     * Adds a card set to the user's collection after verifying its validity and checking for duplicates.
     * @param card_set - The card set to be added.
     * @returns A promise resolving to the status of the card set addition.
     */
    async addSet(card_set: CardSet): Promise<CardSetAddStatus> {
        try {
            if (!card_set.setName) return CardSetAddStatus.MISSING_INFORMATION;

            const db = await DatabaseService.getConnection();

            const ownerID = await UserService.getIDOfUser(this);
            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE set_name = ? AND ownerID = ? LIMIT 1",
                [card_set.setName, ownerID]
            );
            if (rows.length > 0) return CardSetAddStatus.NAME_USED;

            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO card_sets (ownerID, tags, set_name) VALUES (?,?,?)",
                [ownerID, card_set.tags, card_set.setName]
            );
            return CardSetAddStatus.SUCCESS;
        } catch (error) {
            console.error("Card set failed to be entered into DB:", error);
            return CardSetAddStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Deletes a card set by its ID after verifying its existence.
     * @param setID - The ID of the card set to delete.
     * @returns A promise resolving to the status of the card set deletion.
     */
    async deleteSet(setID: number): Promise<CardSetRemoveStatus> {
        try {
            if (setID <= 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            const db = await DatabaseService.getConnection();

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE setID = ? LIMIT 1",
                [setID]
            );
            if (rows.length === 0) return CardSetRemoveStatus.SET_DOES_NOT_EXIST;

            await db.connection.execute<RowDataPacket[]>("DELETE FROM card_sets WHERE setID = ?", [setID]);
            return CardSetRemoveStatus.SUCCESS;
        } catch (error) {
            console.error("Failed to delete card set:", error);
            return CardSetRemoveStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Reports a card set to the database with a reason.
     * @param report - The report containing set ID and reason.
     * @returns A promise resolving to the status of the report.
     */
    async reportSet(report: Report): Promise<CardSetReportStatus> {
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
     * Adds a card to a specific card set after validating the card data.
     * @param card - The card to be added.
     * @returns A promise resolving to the status of the card addition.
     */
    async addCardToSet(card: Card): Promise<CardAddStatus> {
        try {
            if (!card.front_text || !card.back_text) {
                return CardAddStatus.MISSING_INFORMATION;
            }

            const db = await DatabaseService.getConnection();

            card.media = card.media || "No Media";

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT 1 FROM card_sets WHERE setID = ? LIMIT 1",
                [card.setID]
            );
            if (rows.length === 0) {
                return CardAddStatus.SET_DOES_NOT_EXIST;
            }

            await db.connection.execute<RowDataPacket[]>(
                "INSERT INTO card_data (setID, front_text, back_text, media_url) VALUES (?,?,?,?)",
                [card.setID, card.front_text, card.back_text, card.media]
            );

            return CardAddStatus.SUCCESS;
        } catch (error) {
            console.error("Card failed to be entered into DB. Card info:", card, "Failed with Error:", (error as Error).message);
            return CardAddStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Deletes a card from a set (unimplemented).
     * @param card - The card to be deleted.
     * @returns A promise resolving to the status of the card removal.
     */
    async deleteCardFromSet(card: Card): Promise<CardRemoveStatus> {
        console.log('unimplemented');
        return CardRemoveStatus.SUCCESS;
    }

    /**
     * Retrieves all card sets for the current user.
     * @returns A promise resolving to an array of card sets or a failure status.
     */
    async getAllSets(): Promise<CardSet[] | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT ownerID, tags, set_name, setID FROM card_sets WHERE ownerID = ?",
                [await UserService.getIDOfUser(this)]
            );

            const cardSets: CardSet[] = [];
            for (const row of rows) {
                // Ensure tags are parsed into an array
                const tagsArray = row.tags ? row.tags.split(',').map(tag => tag.trim()) : [];
                cardSets.push(makeCardSet(row.ownerID, row.set_name, tagsArray, row.setID));
            }
            return cardSets;
        } catch (error) {
            console.error("Failed to get card sets for user " + this.username + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }

    /**
     * Retrieves a specific card set by its ID.
     * @param setID - The ID of the card set to retrieve.
     * @returns A promise resolving to the card set or a failure status.
     */
    async getSet(setID: number): Promise<CardSet | CardSetGetStatus> {
        try {
            const db = await DatabaseService.getConnection();

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT ownerID, tags, set_name, setID FROM card_sets WHERE setID = ?",
                [setID]
            );
            if (rows.length === 0) return CardSetGetStatus.SET_DOES_NOT_EXIST;

            // Ensure tags are parsed into an array
            const tagsArray = rows[0].tags ? rows[0].tags.split(',').map(tag => tag.trim()) : [];
            return makeCardSet(rows[0].ownerID, rows[0].set_name, tagsArray, rows[0].setID);
        } catch (error) {
            console.error("Failed to get card set" + setID + " for user " + this.username + " with error: ", error);
            return CardSetGetStatus.DATABASE_FAILURE;
        }
    }


    /**
     * Retrieves all cards within a specific set by its ID.
     * @param setID - The ID of the card set.
     * @returns A promise resolving to an array of cards or a failure status.
     */
    async getCards(setID: number): Promise<Card[] | CardGetStatus> {
        try {
            const sets = await this.getSet(setID);

            if (sets === CardSetGetStatus.SET_DOES_NOT_EXIST) return CardGetStatus.SET_DOES_NOT_EXIST;
            else if (sets === CardSetGetStatus.DATABASE_FAILURE) return CardGetStatus.DATABASE_FAILURE;

            const db = await DatabaseService.getConnection();

            const [rows] = await db.connection.execute<RowDataPacket[]>(
                "SELECT cardID, setID, front_text, back_text, media_url FROM card_data WHERE setID = ?",
                [setID]
            );
            if (rows.length === 0) return CardGetStatus.SET_HAS_NO_CARDS;
            const cards: Card[] = [];
            for (const row of rows) {
                cards.push(makeCard(row.setID, row.front_text, row.back_text, row.media_url));
            }
            return cards;
        } catch (error) {
            console.error("Failed to get cards for set" + setID + " for user " + this.username + " with error: ", error);
            return CardGetStatus.DATABASE_FAILURE;
        }
    }
}
export class Moderator extends Regular {
    readonly role: Role = Role.MODERATOR;

}

export class Administrator extends Moderator {
    readonly role: Role = Role.ADMINISTRATOR;
}
