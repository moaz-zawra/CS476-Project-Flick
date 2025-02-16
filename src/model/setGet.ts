import { dbConnect } from "./dbConnect";

/**
 * Retrieves card sets belonging to a specific user.
 *
 * @param {number} uID - The user ID.
 * @returns {Promise<string>} A promise resolving to a JSON string of the card sets.
 *
 */
export async function getSetsFromuID(uID: number): Promise<string> {
    // Load database credentials from environment variables
    const host = process.env.DB_HOST;
    const db_user = process.env.DB_USER;
    const pass = process.env.DB_PASSWORD;

    // Ensure required environment variables are loaded
    if (!host || !db_user || !pass) {
        throw new Error("Failed to load database credentials from environment variables.");
    }

    let connection;
    try {
        // Establish a database connection
        connection = await dbConnect(host, db_user, pass);

        // Select the database
        await connection.query("USE CS476");

        // Fetch card sets belonging to the given user ID
        const [rows] = await connection.execute(
            "SELECT * FROM card_sets WHERE ownerID = ?;",
            [uID]
        );

        return JSON.stringify(rows);
    } catch (error) {
        console.error("Database error:", (error as Error).message);
        return JSON.stringify({ error: (error as Error).message });
    } finally {
        if (connection) await connection.end();
    }
}
