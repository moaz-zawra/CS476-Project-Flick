import mysql from 'mysql2/promise';

/**
 * Establishes a connection to a MySQL database.
 * @async
 * @param hostname - The hostname of the MySQL server.
 * @param user - The username for authentication.
 * @param password - The password for authentication.
 * @returns A promise resolving to a MySQL Connection or rejecting with an Error.
 */
export async function dbConnect(hostname: string, user: string, password: string): Promise<mysql.Connection> {
    try {
        return await mysql.createConnection({
            host: hostname,
            user: user,
            password: password,
        });
    } catch (error) {
        throw new Error(`Database connection failed: ${(error as Error).message}`);
    }
}
