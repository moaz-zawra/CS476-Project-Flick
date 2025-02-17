import {dbConnect} from "./dbConnect";
import {loginStatus} from "./userLogin";

export async function getAllModerators(): Promise<string> {
    let connection;

    // Load database credentials from environment variables
    const host = process.env.DB_HOST;
    const db_user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;

    // Ensure required environment variables are loaded
    if (!host || !db_user || !pass) {
        throw new Error("Failed to load .env file");
    }
    try {
        // Connect to the database
        connection = await dbConnect(host, db_user, pass);

        // Select the database
        await connection.query("USE CS476");

        // Query the database for the user
        const [rows] = await connection.execute(
            "SELECT uID FROM moderators"
        );

        return JSON.stringify(rows);
    } catch (error) {
        console.error("Database error:", (error as Error).message);
        return JSON.stringify({ error: (error as Error).message });
    } finally {
        if (connection) await connection.end();
    }
}