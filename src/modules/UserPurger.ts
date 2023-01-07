import { UserModel } from '../models/User.model';
import colors from 'colors';

// This function purges all non-advisor users > 2 days old
export async function PurgeUsers(): Promise<void> {
    let usersToCheck = await UserModel.find({isAdvisor: false});
    usersToCheck.forEach(userDoc => {
        // User is older than 2 days
        if (Date.now() - (<number> userDoc.createdTimestamp) > (0.5 * 24 * 60 * 60 * 1000)) {
            // Delete the user
            console.log(colors.red(`[PURGER] Purging User ID ${userDoc.id}`));
            userDoc.delete();
            userDoc.save();
        }
    });
    return;
}