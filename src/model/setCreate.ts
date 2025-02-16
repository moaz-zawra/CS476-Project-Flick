import { dbConnect } from "./dbConnect";

/**
 * Represents card set information required for database entry.
 */
export interface CardSet {
    ownerID: number;
    name: string;
    tags: string;
}

/**
 * Creates a new card set object.
 *
 * @param {number} ownerID - The ID of the card set owner.
 * @param {string} name - The name of the card set.
 * @param {string} tags - Tags associated with the card set.
 * @returns {CardSet} The created card set object.
 *
 */
export function makeCardSet(ownerID: number, name: string, tags: string): CardSet {
    return { ownerID, name, tags };
}

/**
 * Adds a card set to the database.
 *
 * @async
 * @param {CardSet} set - The card set object to be added.
 * @returns {Promise<boolean>} A promise resolving to `true` if insertion succeeds, otherwise `false`.
 *
 */
export async function addCardSet(set: CardSet): Promise<boolean> {
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

        // Insert the card set into the database
        const [result] = await connection.execute(
            "INSERT INTO card_sets (ownerID, set_name, tags) VALUES (?, ?, ?);",
            [set.ownerID, set.name, set.tags]
        );

        return true;
    } catch (error) {
        console.error("Database error:", (error as Error).message);
        return false;
    } finally {
        if (connection) await connection.end();
    }
}
