import {dbConnect} from "./dbConnect";
import {checkIfEmailExists} from "./dbGetUser";
import bcrypt = require('bcrypt');

//Info required by the DB to create an entry for a user.
export interface User {
    email: string;
    password: string;
}

//https://en.wikipedia.org/wiki/Bcrypt
function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 12)
}

/**
 * Add a user to the database
 * @param {User} user - The user object containing the email and password of the new user
 * @returns - This function does not return anything
 */
export function dbAddUser(user: User) {
    let connection = dbConnect("localhost", "admin", "admin1234").then(async (connection) => {
        if (connection instanceof Error) {
            throw connection;
        }
        connection.query("USE CS476;");
        checkIfEmailExists(connection, user.email)
            .then(exists => {
                console.log('Email exists:', exists);
            })
            .catch(err => {
                console.error('Error:', err);
            });

        user.password = hashPassword(user.password);

        connection.execute("INSERT INTO users (email, hash) VALUES (?,?);", [user.email, user.password], (err, result) => {
            if (err) {
                console.error('Error:', err);
            }
            else{
                console.log("Success");
                console.log(result);
            }
        })

    });

}



