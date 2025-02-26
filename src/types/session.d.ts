import "express-session";
import {Administrator,Moderator, Regular} from "../model/user";
//Custom session
declare module "express-session" {
    interface SessionData {
        user?: Regular | Moderator | Administrator;
    }
}
