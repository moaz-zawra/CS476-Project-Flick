import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Represents a database connection.
 */
class DB {
    /**
     * Private constructor to initialize the database connection.
     * @param connection - The MySQL connection.
     */
    private constructor(public connection: mysql.Connection) {}

    /**
     * Creates a new database connection.
     * @returns A promise that resolves to an instance of DB or throws an error if connection fails.
     */
    static async create(): Promise<DB> {
        const host = process.env.DB_HOST;
        const user = process.env.DB_USER;
        const password = process.env.DB_PASSWORD;

        // Ensure required environment variables are set
        if (!host || !user || !password) {
            throw new Error("Missing required environment variables for DB connection");
        }

        try {
            // Establish a MySQL connection
            const connection = await mysql.createConnection({ host, user, password });

            // Select the database
            await connection.query("USE CS476");

            return new DB(connection);
        } catch (error) {
            throw new Error(`Database connection failed: ${(error as Error).message}`);
        }
    }
}

/**
 * Checks if the given database connection is still alive.
 * @param connection - The MySQL connection to check.
 * @returns A promise that resolves to `true` if the connection is alive, otherwise `false`.
 */
async function isConnectionAlive(connection: mysql.Connection): Promise<boolean> {
    try {
        await connection.ping();
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Service to manage database connections, ensuring a single instance.
 */
export class DatabaseService {
    private static instance: DB | null = null;

    /**
     * Retrieves the database connection instance.
     * If the connection is inactive or doesn't exist, it creates a new one.
     * @returns A promise that resolves to a `DB` instance.
     */
    static async getConnection(): Promise<DB> {
        if (!this.instance) {
            console.log("Creating new database connection...");
            this.instance = await DB.create();
        } else {
            // Check if the existing connection is still alive
            const isAlive = await isConnectionAlive(this.instance.connection);
            if (!isAlive) {
                console.log("Reconnecting to the database...");
                this.instance = await DB.create();
            }
        }
        return this.instance;
    }
}
