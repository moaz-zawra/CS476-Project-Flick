import {dbConnect} from "./dbConnect";
import {loginStatus} from "./userLogin";
import {checkIfUserExists, hashPassword, registerStatus} from "./userRegister";
import {getuIDFromEmail} from "./utility";

export enum isMod{
    InvalidUser,
    UserIsNotMod,
    UserIsMod,
    DatabaseFailure,
}
export function isModerator(email: string): Promise<isMod>{
    return new Promise((resolve) => {
        let host = process.env.DB_HOST || 'NULL';
        let db_user = process.env.DB_USER || 'NULL';
        let pass = process.env.DB_PASSWORD || 'NULL';

        // Ensure required environment variables are loaded
        if (host === 'NULL' || db_user === 'NULL' || pass === 'NULL') {
            throw new Error("Failed to load .env file");
        }

        // Connect to the database
        dbConnect(host, db_user, pass)
            .then((connection) => {
                if (connection instanceof Error) {
                    console.error(connection.message);
                    return resolve(isMod.DatabaseFailure);
                }
                connection.query("USE CS476", function (err) {
                    if (err) {
                        console.error(err);
                        return resolve(isMod.DatabaseFailure);
                    }
                    getuIDFromEmail(email).then((uID) =>{
                        if (uID == -1){
                            return resolve(isMod.InvalidUser);
                        }
                        connection.execute(
                            "SELECT EXISTS (SELECT 1 FROM moderators WHERE uID = ?) AS is_moderator;",
                            [uID],
                            (err, rows) =>{
                                if (err) {
                                    console.error(err);
                                    return resolve(isMod.DatabaseFailure);
                                }
                                else{
                                    // @ts-ignore
                                    let isModerator = rows[0].is_moderator;
                                    if(isModerator) return resolve(isMod.UserIsMod);
                                    else return resolve(isMod.UserIsNotMod);
                                }
                            }
                        )
                    });
                });
            });
    });
}