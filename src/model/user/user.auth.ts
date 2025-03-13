import {User} from "./user.model";
import {LoginStatus, RegisterStatus} from "./user.types";
import {DatabaseService} from "../database/databaseService";
import {AuthService, UserService} from "./user.service";
import { Regular, Moderator, Administrator } from "./user.roles";
import bcrypt from "bcrypt";

abstract class UserFactory {
    public abstract login(identifier: string, password: string): Promise<User | LoginStatus>;
}

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

            if (!AuthService.isValidPassword(password)) return RegisterStatus.BAD_PASSWORD;
            if (password !== cpassword) return RegisterStatus.PASSWORD_MISMATCH;

            await db.connection.execute(
                "INSERT INTO users (username, email, hash, role) VALUES (?, ?, ?, ?);",
                [username, email, await AuthService.hashPassword(password), "REGULAR"]
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
     * @returns {Promise<User | LoginStatus>} A promise resolving to a user instance or a LoginStatus on failure.
     */
    public async login(identifier: string, password: string): Promise<User | LoginStatus> {
        try {
            const db = await DatabaseService.getConnection();

            const userData = await UserService.getUserByIdentifier(identifier);
            if (!userData) return LoginStatus.USER_DOES_NOT_EXIST;
            
            // Ensure the hash is a string before comparing
            if (typeof userData.hash !== 'string') {
                console.error("Invalid hash type:", typeof userData.hash);
                return LoginStatus.DATABASE_FAILURE;
            }

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