import mysql = require('mysql2');


export function checkIfEmailExists(connection: mysql.Connection, email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        connection.execute("SELECT 1 FROM users WHERE email = ?;", [email], (err, result) => {
            if (err) {
                console.log(err);
                reject(false); // Reject with false on error
            } else {
                resolve(result[0] !== undefined); // Resolve with true/false based on the result
            }
        });
    });
}
