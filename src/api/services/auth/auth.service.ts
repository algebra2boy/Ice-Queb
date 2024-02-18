import { Collection } from 'mongodb';

import { User } from './auth.model.js';

async function login(bodyPayload: User) {}

/**
 * HELPER FUNCTIONS FOR THE AUTH SERVICES
 */

async function findUserByEmail(userCollection: Collection<User>, email: string) {
    const user: User | null = await userCollection.findOne({ email: email });

    // if (!user) {
    //     throw new Http
    // }
}

export { login };
