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
exports.DatabaseService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
/**
 * Represents a database connection.
 */
class DB {
    /**
     * Private constructor to initialize the database connection.
     * @param connection - The MySQL connection.
     */
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Creates a new database connection.
     * @returns A promise that resolves to an instance of DB or throws an error if connection fails.
     */
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = process.env.DB_HOST;
            const user = process.env.DB_USER;
            const password = process.env.DB_PASSWORD;
            // Ensure required environment variables are set
            if (!host || !user || !password) {
                throw new Error("Missing required environment variables for DB connection");
            }
            try {
                // Establish a MySQL connection
                const connection = yield promise_1.default.createConnection({ host, user, password });
                // Select the database
                yield connection.query("USE CS476");
                return new DB(connection);
            }
            catch (error) {
                throw new Error(`Database connection failed: ${error.message}`);
            }
        });
    }
}
/**
 * Checks if the given database connection is still alive.
 * @param connection - The MySQL connection to check.
 * @returns A promise that resolves to `true` if the connection is alive, otherwise `false`.
 */
function isConnectionAlive(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connection.ping();
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
/**
 * Service to manage database connections, ensuring a single instance.
 */
class DatabaseService {
    /**
     * Retrieves the database connection instance.
     * If the connection is inactive or doesn't exist, it creates a new one.
     * @returns A promise that resolves to a `DB` instance.
     */
    static getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.instance) {
                console.log("Creating new database connection...");
                this.instance = yield DB.create();
            }
            else {
                // Check if the existing connection is still alive
                const isAlive = yield isConnectionAlive(this.instance.connection);
                if (!isAlive) {
                    console.log("Reconnecting to the database...");
                    this.instance = yield DB.create();
                }
            }
            return this.instance;
        });
    }
}
exports.DatabaseService = DatabaseService;
DatabaseService.instance = null;
