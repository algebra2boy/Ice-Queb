import { Collection } from 'mongodb';
import status from 'http-status';
import bcrypt from 'bcrypt';

import { MongoDB } from '../../configs/database.config.js';
import { User, RegisterUser } from './auth.model.js';
import { HttpError } from '../../utils/httpError.util.js';
import { generateToken } from '../../utils/token.util.js';

async function login(payload: User): Promise<RegisterUser> {
    const accountCollection: Collection<User> = MongoDB.getIceQuebDB().collection('account');

    const user = await findUserByEmail(accountCollection, payload.email);

    if (!user) {
        throw new HttpError(status.NOT_FOUND, {
            message: 'user does not exist in the database',
            status: 'failure',
        });
    }

    const isPasswordCorrect: boolean = await validatePassword(payload.password, user.password);

    if (!isPasswordCorrect) {
        throw new HttpError(status.UNAUTHORIZED, {
            message: 'user password is not correct',
            status: 'failure',
        });
    }

    return {
        email: user.email,
        isTeacher: user.isTeacher,
        token: generateToken(user.email),
    };
}

async function signup(payload: User): Promise<RegisterUser> {
    const accountCollection: Collection<User> = MongoDB.getIceQuebDB().collection('account');

    const existingUser = await findUserByEmail(accountCollection, payload.email);

    if (existingUser) {
        throw new HttpError(status.FORBIDDEN, {
            message: 'user already exists in the database',
            status: 'failure',
        });
    }

    await createNewUser(accountCollection, payload);

    return {
        email: payload.email,
        isTeacher: payload.isTeacher,
        token: generateToken(payload.email),
    };
}

//
//  HELPER FUNCTIONS FOR THE AUTH SERVICES
//

async function findUserByEmail(accountCollection: Collection<User>, email: string) {
    return await accountCollection.findOne({ email: email });
}

async function createNewUser(accountCollection: Collection<User>, payload: User): Promise<void> {
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    await accountCollection.insertOne({
        email: payload.email,
        password: hashedPassword,
        isTeacher: payload.isTeacher,
    });
}

async function validatePassword(payloadPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(payloadPassword, hashedPassword);
}

export { login, signup };
