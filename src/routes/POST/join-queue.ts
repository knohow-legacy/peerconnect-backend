import { UserModel } from "../../models/User.model";
import { UserQueue } from "../../index";
import express from "express";

/*
    What the API wants:
    req.body = {
        "id": [Your user ID as the client],
        "attributes": null | <Attributes> [Your client attributes / Advanced Filters thing --- Check User.model for Attributes Interface!]
    }

    What the API will send back:
    {
        success: "true",
        position: 1-indexed position in the Queue
    }
*/

export async function run(req: express.Request, res: express.Response): Promise<void> {
    if (!req.body.id ||! await UserModel.findOne({id: req.body?.id})) {
        res.status(400);
        res.send(`ERROR: You must send a valid User ID!`);
    }

    if((await UserModel.findOne({id: req.body.id})).isAdvisor) {
        res.status(405);
        res.send(`ERROR: Only non-advisors can join the queue!`);
    }

    let id = req.body.id;
    if (UserQueue.queueHasId(id)) {
        res.status(400);
        res.send(`ERROR: You are already in the queue!`);
    } else {
        UserQueue.innerQueue.push({
            id: id,
            attributes: req.body?.attributes || null,
            hasBeenChosen: false,
            hasBeenChosenBy: null
        });

        UserQueue.pingQueue(id);
        res.status(200);
        res.send({"success": true, "position": UserQueue.queueIndexOf(id) + 1});
    }
}