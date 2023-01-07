// We still need to connect the user and advisor in video call somehow after this.

import {UserModel} from '../../models/User.model';
import express from 'express';
import { UserQueue } from "../../index";
import { config } from '../../config';

/*
    What the API wants:
        Be signed in with token!
    req.body = {
        "id": [User you chose ID]
    }

    What the API will send back:
        {
            "success": boolean
        }

        If this returns success: false, that means the user has already been taken!
*/

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    let token = null;

    if(typeof req.headers.authorization === `string`){
        token = req.headers.authorization.replace(`Bearer `, ``);
    }

    if(!token &&! config.devMode) {
        res.status(404);
        return res.send(`Error: Invalid Token`);
    }

    let UserToUpdate = await UserModel.findOne({token: token, isAdvisor: true}) || null;

    if (!UserToUpdate) {
        res.status(400);
        res.send(`Error: Invalid Advisor User!`);
    }

    if (!req.body.id) {
        res.status(400);
        res.send(`Error: Invalid User to Get!`);
    }

    let id = req.body.id;

    if (!UserQueue.queueHasId(id) || UserQueue.fetchQueueEntry(id)?.hasBeenChosen) {
        res.status(409);
        return res.send({"success": false});
    } else {
        UserQueue.innerQueue[UserQueue.queueIndexOf(id)].hasBeenChosen = true;
        UserQueue.innerQueue[UserQueue.queueIndexOf(id)].hasBeenChosenBy = UserToUpdate.id;
        setTimeout(async () => {
            UserQueue.removeFromQueue(id);
        }, 20 * 1000);

        return res.send({
            "success": true
        });
    }
}