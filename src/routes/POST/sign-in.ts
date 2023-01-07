import express from 'express';
import { UserModel, ModelToObj } from '../../models/User.model';

/*
    What the API wants: NOTHING!

    What will be returned: A new User (but without the advisor stuff) [Check the interface in User.model]
*/

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    let ourNewUser = new UserModel({isAdvisor: false});
    ourNewUser.save();
    return res.send(ModelToObj(ourNewUser));
}