import { Attribute } from "../models/User.model";
import colors from 'colors';

interface QueueObj {
    id: string,
    attributes?: null | Attribute[],
    hasBeenChosen: boolean,
    hasBeenChosenBy?: string | null
}

interface PingObj {
    id: string,
    lastPingedTimestamp: number
}

export class TheUserQueue {
    public innerQueue: Array<QueueObj>;
    public pingTracker: Array<PingObj>;

    constructor() {
        console.log(colors.blue(`[UserQueue] User Queue Started!`));
        this.innerQueue = [];
        this.pingTracker = [];

        this.purgeInactivity();
        // Purge the inactive folks every 40 seconds
        setInterval(async () => {
            this.purgeInactivity();
        }, 40 * 1000);
    }

    private async purgeInactivity(): Promise<void> {
        for (let i = 0; i < this.pingTracker.length; i++) {
            if (Date.now() - this.pingTracker[i].lastPingedTimestamp > (35 * 1000)) {
                this.removeFromQueue(this.pingTracker[i].id);
                this.pingTracker.splice(i, 1);
            }
        }
    }

    public queueHasId(userID: string): boolean {
        for (let i = 0; i < this.innerQueue.length; i++) {
            if (this.innerQueue[i].id == userID) return true;
        }
        return false;
    }

    private pingTrackerHasID(userID: string): boolean {
        for (let i = 0; i < this.pingTracker.length; i++) {
            if (this.pingTracker[i].id == userID) return true;
        }
        return false;
    }

    private pingTrackerIndexOf(userID: string): number | null {
        for (let i = 0; i < this.pingTracker.length; i++) {
            if (this.pingTracker[i].id == userID) return i;
        }
        return null;
    }

    public pingQueue (userID: string): void {
        if (this.pingTrackerHasID(userID)) {
            this.pingTracker[this.pingTrackerIndexOf(userID)] = {
                id: userID,
                lastPingedTimestamp: Date.now()
            };
        } else {
            this.pingTracker.push({id: userID, lastPingedTimestamp: Date.now()});
        }
        return;
    }

    public fetchQueueEntry(userID: string): QueueObj | null {
        if (!this.queueHasId(userID)) return null;
        else return this.innerQueue[this.queueIndexOf(userID)];
    }

    public queueIndexOf(userID: string): number | null {
        for (let i = 0; i < this.innerQueue.length; i++) {
            if (this.innerQueue[i].id == userID) return i;
        }
        return null;
    }

    public removeFromQueue(userID: string): void {
        this.innerQueue.splice(this.queueIndexOf(userID), 1);
    }
}