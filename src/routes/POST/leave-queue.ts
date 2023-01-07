import { UserModel } from "../../models/User.model";
import { UserQueue } from "../../index";
import express from "express";

/* Ping the Queue every 30 seconds at __LEAST__ to stay in it!
    What the API wants:
    req.body = {
        "id": [Your user ID]
    }

    What the API will send back:
    {
        "success": true
    }
*/

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    if (!req.body.id ||! await UserModel.findOne({id: req.body?.id})) {
        res.status(400);
        res.send(`ERROR: You must send a valid User ID!`);
    }

    if((await UserModel.findOne({id: req.body.id})).isAdvisor) {
        res.status(405);
        res.send(`ERROR: Only non-advisors can join the queue!`);
    }

    let id = req.body.id;
    if (!UserQueue.queueHasId(id)) {
        res.status(400);
        res.send(`ERROR: You are not in the queue!`);
    } else {
        UserQueue.removeFromQueue(id);
        return res.send({"success": true});
    }
}