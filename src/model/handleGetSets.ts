import {isRegular} from "./utility";
import {Regular} from "./user";
import express = require("express");

export async function handleGetSets(req: express.Request, res: express.Response){
    if( req.session.user ) {
        if (isRegular(req.session.user)) {
            const user = Object.assign(new Regular("", ""), req.session.user);
            const sets = await user.getAllSets();
            res.send(sets);
        } else {
            res.redirect("/?status=unauthorized");
        }
    } else {
        res.redirect('/')
    }
}