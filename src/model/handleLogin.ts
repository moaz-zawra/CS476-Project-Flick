import {Administrator, Moderator, Regular, UserCreator, User} from "./user";
import {LoginStatus} from "../types/types";
import {logUserActivity} from "./utility";
import express = require("express");

// This is called a type guard
// https://www.typescriptlang.org/docs/handbook/advanced-types.html
export function isUser(obj: any): obj is User {
    return obj && typeof obj === "object" && "username" in obj && "email" in obj && "role" in obj;
}

export async function handleLogin(req: express.Request, res: express.Response): Promise<void> {
    let login = await new UserCreator().login(req.body.identifier, req.body.password);
    if (isUser(login)) {
        if (login instanceof Administrator) {
            req.session.user = login;
            res.redirect('/');

        } else if (login instanceof Moderator) {
            req.session.user = login;
            res.redirect('/');
        } else if (login instanceof Regular) {
            req.session.user = login;
            res.redirect('/');
        }
    } else {
        switch (login) {
            case LoginStatus.USER_DOES_NOT_EXIST:
                res.redirect('/login?status=does-not-exist');
                break;
            case LoginStatus.DATABASE_FAILURE:
                res.redirect('/login?status=error');
                break;
            case LoginStatus.WRONG_PASSWORD:
                res.redirect('/login?status=wrong-password');
                break;
            default:
                res.redirect('/login?status=error');
                break;
        }
    }
}
