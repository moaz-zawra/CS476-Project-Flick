import mysql from 'mysql2/promise';
import dotenv = require('dotenv');
import path = require('path');
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class DB {
    private constructor(public connection: mysql.Connection | Error) {}

    static async create(): Promise<DB> {
        try {
            const host = process.env.DB_HOST;
            const user = process.env.DB_USER;
            const password = process.env.DB_PASSWORD;

            if (!host || !user || !password) {
                return new DB(new Error("Failed to load .env file"));
            }

            const connection = await mysql.createConnection({host, user, password});
            await connection.query("USE CS476");
            return new DB(connection);
        } catch (error) {
            return new DB(new Error(`Database connection failed: ${(error as Error).message}`));
        }
    }
}
async function isConnectionAlive(connection: mysql.Connection): Promise<boolean> {
    try {
        await connection.ping();
        return true;
    } catch (error) {
        return false;
    }
}

export class DatabaseService {
    private static instance: DB | null = null;

    static async getConnection(): Promise<DB> {
        if (!this.instance || this.instance.connection instanceof Error) {
            this.instance = await DB.create();
        } else {
            const isAlive = await isConnectionAlive(this.instance.connection as mysql.Connection);
            if (!isAlive) {
                console.log("Reconnecting to the database...");
                this.instance = await DB.create();
            }
        }
        return this.instance;
    }

}
