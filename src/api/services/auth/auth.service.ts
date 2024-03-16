import { Collection } from 'mongodb';
import status from 'http-status';
import bcrypt from 'bcrypt';

import { MongoDB } from '../../configs/database.config.js';
import { DatabaseCollection } from '../../configs/constants.config.js';
import { ErrorMessages as error } from '../../configs/errorsMessage.config.js';
import { User, RegisterUser } from './auth.model.js';
import { HttpError } from '../../utils/httpError.util.js';
import { generateToken } from '../../utils/token.util.js';

async function login(payload: User): Promise<RegisterUser> {
    const accountCollection: Collection<User> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.Account,
    );

    const user = await findUserByEmail(accountCollection, payload.email);

    if (!user) {
        throw new HttpError(status.NOT_FOUND, error.USER_NOT_FOUND(payload.email));
    }

    const isPasswordCorrect: boolean = await validatePassword(payload.password, user.password);

    if (!isPasswordCorrect) {
        throw new HttpError(status.UNAUTHORIZED, error.USER_PASSWORD_NOT_CORRECT(payload.email));
    }

    return {
        email: user.email,
        isTeacher: user.isTeacher,
        token: generateToken(user.email),
        status: 'success'
    };
}

async function signup(payload: User): Promise<RegisterUser> {
    const accountCollection: Collection<User> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.Account,
    );

    const existingUser = await findUserByEmail(accountCollection, payload.email);

    if (existingUser) {
        throw new HttpError(status.FORBIDDEN, error.USER_ALREADY_EXISTS(payload.email));
    }

    await createNewUser(accountCollection, payload);

    return {
        email: payload.email,
        isTeacher: payload.isTeacher,
        token: generateToken(payload.email),
        status: 'success'
    };
}

////////////////////////////////////////////////////////////////////////////////
//////////////////  HELPER FUNCTIONS FOR THE AUTH SERVICES    //////////////////
////////////////////////////////////////////////////////////////////////////////
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
