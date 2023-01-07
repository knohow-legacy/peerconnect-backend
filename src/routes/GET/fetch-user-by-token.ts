import express from 'express';
import { UserModel, ModelToObj } from '../../models/User.model';
/*
    What the API needs:
        Paramater 1: User Token to find

    What the API will return:
        User OBJ (User WITH the Token)
*/

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    if(! req.params.var1 ||! await UserModel.findOne({token: req.params.var1})){
        return res.send(`ERROR: Something went wrong! Please check everything.`);
    }
    return res.send(ModelToObj(await UserModel.findOne({token: req.params.var1}))) || null;
}

export let params = 1;