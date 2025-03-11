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
exports.AuthService = exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const databaseService_1 = require("../database/databaseService");
const user_types_1 = require("./user.types");
const user_roles_1 = require("./user.roles");
class UserService {
    static changeUserDetails(user, username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                if (username != "" && email != "" && user) {
                    yield db.connection.execute("UPDATE users SET username = ?, email = ? WHERE username = ?", [username, email, user.username]);
                    return user_types_1.UserChangeStatus.SUCCESS;
                }
                else
                    return user_types_1.UserChangeStatus.USER_DOES_NOT_EXIST;
            }
            catch (e) {
                console.error(`Error changing user details: ${e.message}`);
                return user_types_1.UserChangeStatus.DATABASE_FAILURE;
            }
        });
    }
    static changeUserPassword(user, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const userData = yield UserService.getUserByIdentifier(user.email);
                if (userData) {
                    const isPasswordCorrect = yield bcrypt_1.default.compare(currentPassword, userData.hash);
                    if (isPasswordCorrect) {
                        const hash = yield AuthService.hashPassword(newPassword);
                        yield db.connection.execute("UPDATE users SET hash = ? WHERE username = ?", [hash, userData.username]);
                        return user_types_1.UserChangeStatus.SUCCESS;
                    }
                    else
                        return user_types_1.UserChangeStatus.INCORRECT_PASSWORD;
                }
                else
                    return user_types_1.UserChangeStatus.USER_DOES_NOT_EXIST;
            }
            catch (e) {
                console.error(`Error changing user passwowrd: ${e.message}`);
                return user_types_1.UserChangeStatus.DATABASE_FAILURE;
            }
        });
    }
    /**
     * Retrieves a user by their email address.
     * @async
     * @param email - The user's email address.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    static getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const [rows] = yield db.connection.execute("SELECT username, email, hash, role FROM users WHERE email = ?", [email]);
                return rows.length ? rows[0] : null;
            }
            catch (e) {
                console.error(`Error getting user by email: ${e.message}`);
                return null;
            }
        });
    }
    /**
     * Retrieves a user by their username.
     * @async
     * @param username - The user's username.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    static getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield databaseService_1.DatabaseService.getConnection();
            const [rows] = yield db.connection.execute("SELECT username, email, hash, role FROM users WHERE username = ?", [username]);
            return rows.length ? rows[0] : null;
        });
    }
    /**
     * Retrieves a user by their email or username (identifier).
     * @async
     * @param identifier - The user's username or email.
     * @returns {Promise<RowDataPacket | null>} A promise resolving to the user data or null if no user is found.
     */
    static getUserByIdentifier(identifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield databaseService_1.DatabaseService.getConnection();
            const [rows] = yield db.connection.execute("SELECT username, email, hash, role FROM users WHERE username = ? OR email = ?", [identifier, identifier]);
            return rows.length ? rows[0] : null;
        });
    }
    /**
     * Retrieves the user ID (uID) based on the provided username.
     * @async
     * @param {User} user - The user object containing the username.
     * @returns {Promise<number>} A promise resolving to the user ID or -1 if not found.
     */
    static getIDOfUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(user === null || user === void 0 ? void 0 : user.username)) {
                console.error("Invalid user object provided.");
                return -1;
            }
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const [rows] = yield db.connection.execute("SELECT uID FROM users WHERE username = ?", [user.username]);
                return rows.length > 0 ? rows[0].uID : -1;
            }
            catch (error) {
                console.error(`Error fetching user ID: ${error.message}`);
                return -1;
            }
        });
    }
    /**
     * Logs a user action into the database.
     * @async
     * @param {User} user - The user performing the action.
     * @param {UserAction} action - The action being logged.
     * @returns {Promise<boolean>} - Resolves to true if the action was logged successfully, false otherwise.
     */
    static logUserAction(user, action) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const uID = yield this.getIDOfUser(user);
                if (uID === -1) {
                    console.error("Invalid user ID, cannot log activity.");
                    return false;
                }
                yield db.connection.execute("INSERT INTO user_activity (uID, action) VALUES (?, ?)", [uID, action]);
                return true;
            }
            catch (error) {
                console.error(`Error logging user action: ${error.message}`);
                return false;
            }
        });
    }
    /**
     * Retrieves all user activity for a given user (all-time).
     * @async
     * @param {User} user - The user whose activity is being retrieved.
     * @returns {Promise<UserActivity[] | null>} - Resolves to an array of user activities or null if an error occurs.
     */
    static getUserActivityAllTime(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const uID = yield this.getIDOfUser(user);
                if (uID === -1) {
                    console.error("Invalid user ID, cannot fetch activity.");
                    return null;
                }
                const [rows] = yield db.connection.execute("SELECT activityID, uID, action, time FROM user_activity WHERE uID = ? ORDER BY time DESC", [uID]);
                return rows.length ? rows : [];
            }
            catch (error) {
                console.error(`Error fetching user activity: ${error.message}`);
                return null;
            }
        });
    }
    /**
     * Retrieves user activity for the last 7 days.
     * @async
     * @param {User} user - The user whose activity is being retrieved.
     * @returns {Promise<UserActivity[] | null>} - Resolves to an array of user activities or null if an error occurs.
     */
    static getUserActivityLast7Days(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const db = yield databaseService_1.DatabaseService.getConnection();
                const uID = yield this.getIDOfUser(user);
                if (uID === -1) {
                    console.error("Invalid user ID, cannot fetch activity.");
                    return null;
                }
                const [rows] = yield db.connection.execute(`SELECT activityID, uID, action, time 
                 FROM user_activity 
                 WHERE uID = ? AND time >= NOW() - INTERVAL 7 DAY 
                 ORDER BY time DESC`, [uID]);
                return rows.length ? rows : [];
            }
            catch (error) {
                console.error(`Error fetching user activity (last 7 days): ${error.message}`);
                return null;
            }
        });
    }
    /**
     * Retrieves all users with the role REGULAR.
     * @async
     * @returns {Promise<Regular[]>} A promise resolving to an array of regular users.
     */
    static getRegularUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield databaseService_1.DatabaseService.getConnection();
            const [rows] = yield db.connection.execute("SELECT username, email FROM users WHERE role = 'REGULAR'");
            // Map RowDataPacket to Regular instances
            return rows.map(row => new user_roles_1.Regular(row.username, row.email));
        });
    }
    /**
     * Retrieves all users with the role MODERATOR.
     * @async
     * @returns {Promise<RowDataPacket[]>} A promise resolving to an array of moderator users.
     */
    static getModeratorUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield databaseService_1.DatabaseService.getConnection();
            const [rows] = yield db.connection.execute("SELECT username, email, role FROM users WHERE role = 'MODERATOR'");
            return rows.map(row => new user_roles_1.Moderator(row.username, row.email));
        });
    }
}
exports.UserService = UserService;
class AuthService {
    /**
     * Validates whether the provided password meets criteria.
     * @param password - The password to validate.
     * @returns {boolean} True if the password is valid, false otherwise.
     */
    static isValidPassword(password) {
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
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.hash(password, 12);
        });
    }
}
exports.AuthService = AuthService;
