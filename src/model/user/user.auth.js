"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreator = void 0;
const user_types_1 = require("./user.types");
const databaseService_1 = require("../database/databaseService");
const user_service_1 = require("./user.service");
const user_roles_1 = require("./user.roles");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserFactory {
}
class UserCreator extends UserFactory {
    /**
     * Registers a new user in the system.
     * @async
     * @param username - The desired username for the new user.
     * @param email - The email address of the new user.
     * @param password - The password for the new user.
     * @param cpassword - The confirmation password to verify correctness.
     * @returns {Promise<RegisterStatus>} A promise resolving to a RegisterStatus indicating success or failure.
     */
    registerUser(username, email, password, cpassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const emailExists = yield user_service_1.UserService.getUserByEmail(email);
                if (emailExists)
                    return user_types_1.RegisterStatus.EMAIL_USED;
                const usernameExists = yield user_service_1.UserService.getUserByUsername(username);
                if (usernameExists)
                    return user_types_1.RegisterStatus.USERNAME_USED;
                if (!user_service_1.AuthService.isValidPassword(password))
                    return user_types_1.RegisterStatus.BAD_PASSWORD;
                if (password !== cpassword)
                    return user_types_1.RegisterStatus.PASSWORD_MISMATCH;
                yield db.connection.execute("INSERT INTO users (username, email, hash, role) VALUES (?, ?, ?, ?);", [username, email, yield user_service_1.AuthService.hashPassword(password), "REGULAR"]);
                return user_types_1.RegisterStatus.SUCCESS;
            }
            catch (error) {
                console.error("Error:", error);
                return user_types_1.RegisterStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Logs in a user by validating their identifier (email or username) and password.
     * @async
     * @param identifier - The username or email of the user.
     * @param password - The user's password.
     * @returns {Promise<User | LoginStatus>} A promise resolving to a user instance or a LoginStatus on failure.
     */
    login(identifier, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const userData = yield user_service_1.UserService.getUserByIdentifier(identifier);
                if (!userData)
                    return user_types_1.LoginStatus.USER_DOES_NOT_EXIST;
                const isPasswordCorrect = yield bcrypt_1.default.compare(password, userData.hash);
                if (!isPasswordCorrect)
                    return user_types_1.LoginStatus.WRONG_PASSWORD;
                switch (userData.role) {
                    case "REGULAR": {
                        return new user_roles_1.Regular(userData.username, userData.email);
                    }
                    case "MODERATOR": {
                        return new user_roles_1.Moderator(userData.username, userData.email);
                    }
                    case "ADMINISTRATOR": {
                        return new user_roles_1.Administrator(userData.username, userData.email);
                    }
                    default: {
                        console.error("Invalid role: " + userData.role);
                        return user_types_1.LoginStatus.OTHER;
                    }
                }
            }
            catch (error) {
                console.error(`Login failed: ${error.message}`);
                return user_types_1.LoginStatus.DATABASE_FAILURE;
            }
        });
    }
}
exports.UserCreator = UserCreator;
