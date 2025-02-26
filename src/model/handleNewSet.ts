import express = require('express');
import {Regular, UserService} from "./user";
import {makeCardSet, CardSetAddStatus} from "../types/types";
import {isRegular} from "./utility";



export async function handleNewSet(req: express.Request, res: express.Response): Promise<void> {
    if( req.session.user ) {
        if (isRegular(req.session.user)){
            //gets messed up when "serialized" and "unserialized" in the session variable, causing the type of req.session.user to just be object. 
            const user = Object.assign(new Regular("", ""), req.session.user);
            const set = makeCardSet(await UserService.getIDOfUser(req.session.user), req.body.setName, req.body.tags);
            const status = await user.addSet(set);
            switch (status) {
                case (CardSetAddStatus.SUCCESS):{
                    res.redirect("/?status=success");
                    break;
                }
                case (CardSetAddStatus.DATABASE_FAILURE):{
                    res.send("ERROR!");
                    break;
                }
                case (CardSetAddStatus.MISSING_INFORMATION):{
                    res.send("Missing Info!");
                    break;
                }
                case (CardSetAddStatus.NAME_USED):{
                    res.send("Name already used!");
                    break;
                }
                default:{
                    res.send("ERROR!")
                    break;
                }
            }
        }

        else{
          res.redirect("/?status=unauthorized");
        }

    }
    else {
        res.redirect('/')
    }
}