import { UserModel } from '../../models/User.model';
import express from 'express';

// Send a request to this API while signed in with a token, and it will delete said account
export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    let token = null;

    if(typeof req.headers.authorization === `string`){
        token = req.headers.authorization.replace(`Bearer `, ``);
    }

    if(!token ||! await UserModel.findOne({token: token})) {
        res.status(404);
        return res.send(`Error: Invalid User Token`);
    }

    await UserModel.deleteOne({token: token});
    return res.send({"success": true});
}