import express from 'express';
import {UserModel, ModelToObj} from '../../models/User.model';

/*
    What the API is expecting:
    req.body = {
        "attributes": <Attribute[]> [Check User.model.ts for Attribute Interface!]
    }

    What the API will return
    {
        "success": true/false
        "user": The new complete user
    }
*/

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    if (!req.body ||! req.body.attributes) {
        res.status(400);
        res.send(`Error! You must send an attributes object!`);
    }

    let token = null;
    if(typeof req.headers.authorization === `string`){
        token = req.headers.authorization.replace(`Bearer `, ``);
    }
    if(!token){
        res.status(404);
        return res.send(`Error: Invalid User Token`);
    }
    let UserToUpdate = await UserModel.findOne({token: token}) || null;
    if (!UserToUpdate) {
        res.status(400);
        res.send(`User not found!`);
    }

    UserToUpdate.attributes = req.body.attributes;
    UserToUpdate.save();
    res.status(200);
    return res.send({"success": true, "user": ModelToObj(await UserModel.findOne({token: token}))});
}

export let params = 0;