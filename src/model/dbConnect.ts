import path = require('path');
import mysql = require('mysql2');


/**
 * Custom type representing a Promise that resolves to either a MySQL Connection or a QueryError.
 */
type dbConnection = Promise<mysql.Connection | mysql.QueryError>;

/**
 * Establishes a connection to a MySQL database.
 *
 * @param {string} hostname - The hostname of the MySQL server.
 * @param {string} user - The username for authentication.
 * @param {string} password - The password for authentication.
 * @returns {dbConnection} A promise resolving to either a MySQL Connection or a QueryError.
 */
export function dbConnect(hostname:string, user:string, password:string): dbConnection {
    let connection = mysql.createConnection({
        host: hostname,
        user: user,
        password: password,
    })

    //Return statement, creates a new promise and then calls the connection.connect function, which is asynchronous.
    return new Promise((resolve, reject) => {
        connection.connect(function (err) {
            //Check if error is there, if it is, we have failed to connect to the database.
            if (err) {
                //Set the value of the promise to the QueryError
                resolve(err);
            } else {
                //Set the value of the promise to the Connection
                resolve(connection);
            }
        });
    });
}