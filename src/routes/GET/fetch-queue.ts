import express from 'express';
import { config } from '../../config';
import { UserQueue } from '../../index';
import { Attribute, UserModel, ModelToObj } from '../../models/User.model';

/*
    What the API wants:
        Be Signed in with your token

    What the API will return: UserQueue + Each user element has a similarity rating + Maximum possible similarity
    [This is an array where the 0th element is the next user in line. Check POST/join-queue.ts for more info on the array]
*/

function calculateSimilarity(UserAttributes: Attribute[] | null, AdvisorAttributes: Attribute[] | null): number {
    if (!UserAttributes ||! AdvisorAttributes) return 0;
    let UserStrings = UserAttributes.map(obj => `${obj.category}-${obj.name}`);
    let AdvisorStrings = AdvisorAttributes.map(obj => `${obj.category}-${obj.name}`);
    let similarityScore = UserStrings.filter(obj => AdvisorStrings.includes(obj)).length;
    return similarityScore;
}

export async function run(req: express.Request, res: express.Response): Promise<express.Response> {
    let token = null;

    if(typeof req.headers.authorization === `string`){
        token = req.headers.authorization.replace(`Bearer `, ``);
    }

    if(!token &&! config.devMode) {
        res.status(404);
        return res.send(`Error: Invalid User Token`);
    }

    let UserToUpdate = await UserModel.findOne({token: token, isAdvisor: true}) || null;
    if (config.devMode) UserToUpdate = await UserModel.findOne({id: `1`});

    if (!UserToUpdate) {
        res.status(400);
        res.send(`Error: Invalid User!`);
    }

    let attributes: Attribute[] | null = null;
    if(UserToUpdate.attributes) {
        attributes = ModelToObj(UserToUpdate).attributes;
    } else if (config.devMode &&! UserToUpdate.attributes) {
        attributes = [
            {name: `Male`, category: `gender`},
            {name: `10`, category: `grade`},
            {name: `Just Chatting`, category: `interests`},
            {name: `HS@MC`, category: `school`},
            {name: `Math`, category: `subject`}
        ];
    } else attributes = null;

    let copyQ = [...UserQueue.innerQueue];
    for (let i = 0; i < copyQ.length; i++) {
        copyQ[i][`similarity`] = calculateSimilarity(copyQ[i].attributes, attributes);
        copyQ[i][`similarityMax`] = attributes.length;
    }

    res.status(200);
    return res.send(copyQ);
}

export let params = 0;