import express from 'express';
import { UserModel, ModelToObj, filterUser } from '../../models/User.model';
/*
    What the API needs:
        Paramater 1: User ID to find

    What the API will return:
        Filtered User OBJ (User without the Token)
*/

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    if(!req.params.var1 ||! await UserModel.findOne({id: req.params.var1})) return res.send(`ERROR: Something went wrong! Please check everything`);
    return res.send(filterUser(ModelToObj(await UserModel.findOne({id: req.params.var1})))) || null;
}

export let params = 1;