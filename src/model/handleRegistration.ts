import express = require('express');
import { UserCreator } from "./user";
import {RegisterStatus} from "../types/types";
export async function handleRegistration(req: express.Request, res: express.Response): Promise<void> {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    let registrationStatus = await new UserCreator().registerUser(username, email, password, cpassword);
    switch (registrationStatus) {
        case(RegisterStatus.SUCCESS):
            res.redirect('/login?status=registration-success');
            break;
        case(RegisterStatus.EMAIL_USED): return res.redirect('/register?status=email-used');
        case(RegisterStatus.USERNAME_USED): return res.redirect('/register?status=username-used');
        case(RegisterStatus.BAD_PASSWORD): return res.redirect('/register?status=bad-password');
        case(RegisterStatus.PASSWORD_MISMATCH): return res.redirect('/register?status=mismatch-password');
        case(RegisterStatus.DATABASE_FAILURE): return res.redirect('/register?status=error');
        default: return res.redirect('/register?status=error');

    }
}