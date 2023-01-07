// Import third party libraries
import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import colors from 'colors';
import http from 'http';

// Import first party libraries and data
import {config} from './config';
import { RouteHandler } from './RouteHandler';
import { UserModel } from './models/User.model';
import { PurgeUsers } from './modules/UserPurger';
import {TheUserQueue} from './modules/UserQueue';
import { startWebsocketServer } from './modules/ChatServer';

// Run DotENV
dotenv.config({path: `secret.env`});

config.devMode ? console.log(colors.bold(colors.yellow(`[STARTUP] Starting up in DEV mode!`))) : console.log(colors.bold(colors.yellow(`[STARTUP] Starting up in PROD mode!`)));

export let app = express();
export let server = http.createServer(app);
export let uptimestart = Date.now();
export let UserQueue = new TheUserQueue();

export let isMongoWorking = true;
mongoose.set(`strictQuery`, true);


console.log(colors.yellow(`[CHATSERVER] Starting chat server...`));
startWebsocketServer(server);

// Setup rate limit for the API
const limiter = rateLimit({
    windowMs: 1000,
    max: 100, // Limit each IP to 100 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(bodyParser.json({limit: `50mb`}));

// Cors Headers
if(config[`no-cors`]){
    app.use((req, res, next) => {
        res.append(`Access-Control-Allow-Origin`, [`*`]).append(`Access-Control-Allow-Methods`, `GET,PUT,POST,PATCH,DELETE`).append(`Access-Control-Allow-Headers`, `Content-Type,Authorization`);
        next();
    });
}

let MainRouteHandler = new RouteHandler(`1`);
MainRouteHandler.LoadRoutes();

// Start user purging
console.log(colors.yellow(`[PURGER] Starting user purger....`));
PurgeUsers();
setInterval(async () => {
    await PurgeUsers();
},  12 * 60 * 60 * 1000);
console.log(colors.green(`[PURGER] User Purger Started!`));

mongoose.connect(`${config.devMode ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PROD}`, {
    dbName: `peerconnect` // MongoDB Database Name!
  }).then(async () => {
    console.log(colors.yellow(`[MongoDB] Checking for default DB entries....`));
    // Default user
    if (!await UserModel.findOne({id: 1})) {
        console.log(colors.red(`[MongoDB] Default User not found! Creating...`));
        let defaultUser = await UserModel.create({
            id: 1,
            name: `default`,
            isOnCall: false,
            token: `systemtoken123`
        });
        await defaultUser.save().then(() => console.log(colors.green(`[MongoDB] Default user created!`)));
    } else console.log(colors.green(`[MongoDB] Default user found!`));
    console.log(colors.green(`[MongoDB] Succesfully Connected to MongoDB Atlas!`));
    console.log(colors.green(`[APP] PeerConnect by Knohow Started!`));
    console.log(`_______________`);
}).catch(() => {
    isMongoWorking = false;
    console.error(colors.red(`[MongoDB] ERROR - COULDN'T CONNECT TO MONGODB`));
});

// Make sure Azure finds port 8080 in PROD mode!
let portToUse = parseInt(`${config.devMode ? process.env.DEV_PORT : process.env.PROD_PORT}`) || 8080;
server.listen(portToUse, () => {
    console.log(colors.green(`[APP] App started on port ${portToUse}`));
});