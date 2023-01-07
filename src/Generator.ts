import crypto from 'crypto';

export function randomString(size: number): string {
   return crypto.randomBytes(size).toString(`hex`);
}

// https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
export function randomIntBetween(min: number, max: number): number {
   return Math.floor(Math.random() * (max - min + 1) + min);
}

// randomIntWithWeight({0:0.8, 1:0.1, 2:0.1}) -> most likely 0
// Weights must sum to 1.0!
// https://stackoverflow.com/questions/8435183/generate-a-weighted-random-number
export function randomIntWithWeight(spec): number {
   let i, sum=0, r=Math.random();
   for (i in spec) {
     sum += spec[i];
     if (r <= sum) return parseInt(i);
   }
 }