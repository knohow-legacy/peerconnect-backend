import express from 'express';
import { createHash } from 'crypto';
import { ModelToObj, UserModel } from '../../models/User.model';

/*
    This end point signs the user in, creating a new user if they do not previously exist.
    Then, it returns their user details.

    What the API is expecting:
    {
        userID: string,
        name: string,
        pfp: string,
        email: string
    }

    What it will return
    {
        success: true,
        user: UserModel instance
    }
*/


export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    if(!req.body.userID || !req.body.name || !req.body.pfp || !req.body.email){
        res.status(400);
        return res.send({success: false, error: `Missng auth data!`});
    }
    if(!parseInt(req.body.userID)){
        res.status(400);
        return res.send({success: false, error: `Invalid user ID!`});
    }

    const token = createHash(`sha256`).update(req.body.userID + req.body.email).digest(`hex`);

    let user = await UserModel.findOne({token});

    if(!user){
        user = new UserModel({
            "name": (<string> req.body.name).substring(0, 32),
            "pfp": req.body.pfp || `none`,
            "token": token,
            "isAdvisor": true
        });
        user.save();
    }

    if (token !== user.token) {
        user.token = token;
        user.save();
    }

    res.status(200);

    // Return the user instance
    return res.json({
        success: true,
        token,
        userID: user.id,
        user: ModelToObj(user)
    });
}