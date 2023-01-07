/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import {randomString} from '../Generator';

let UserSchema = new mongoose.Schema({
    name: {type: String, required: true, default: ():string => `default-name-${randomString(5)}`},
    id: {type: String, required: true, default: ():string => randomString(10)},
    attributes: {type: Array, required: false, default: []}, // The different attributes that advisors can have
    pfp: {type: String, required: false, default: `https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png`},
    token: {type: String, required: false},
    isAdvisor: {type: Boolean, required: true, default: false},
    isOnCall: {type: Boolean, required: true, default: false},
    createdTimestamp: {type: Number, required: true, default: Date.now()}
}, { collection: `users`});

export interface Attribute {
    name: string;
    category: string;
}

export interface User {
    name: string,
    id: string,
    attributes?: Attribute[] | null,
    pfp?: string | null,
    token?: string | null,
    isAdvisor: boolean,
    isOnCall?: boolean,
    createdTimestamp: number
}


export function filterUser(user: User): User {
    delete user.token;
    return user;
}

export function ModelToObj(userModel: any): User {
    let script = JSON.parse(JSON.stringify(userModel.toObject()));
    delete script._id;
    delete script.__v;
    return script;
}

export let UserModel = mongoose.model(`User`, UserSchema);