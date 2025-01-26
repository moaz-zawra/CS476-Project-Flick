import path = require('path');
import mysql = require('mysql2');

type dbConnection = Promise<mysql.Connection | mysql.QueryError>; // Custom type to have a more clear return type.
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