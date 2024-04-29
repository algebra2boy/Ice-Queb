import { Collection } from 'mongodb';
import status from 'http-status';
import bcrypt from 'bcrypt';

import { MongoDB } from '../../configs/database.config.js';
import { ErrorMessages as error } from '../../configs/errorsMessage.config.js';
import { User, RegisterUser, ResetUser } from './auth.model.js';
import { OfficeHourList } from '../officeHour/officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';
import { generateToken } from '../../utils/token.util.js';

async function login(payload: User): Promise<RegisterUser> {
    const email = payload.email.toLowerCase();
    const isTeacher = payload.isTeacher;

    const accountCollection = isTeacher
        ? MongoDB.getTeacherAccountCollection()
        : MongoDB.getAccountCollection();

    const user = await findUserByEmail(accountCollection, email);

    if (!user) {
        throw new HttpError(status.NOT_FOUND, error.USER_NOT_FOUND(email));
    }

    const isPasswordCorrect: boolean = await validatePassword(payload.password, user.password);

    if (!isPasswordCorrect) {
        throw new HttpError(status.UNAUTHORIZED, error.USER_PASSWORD_NOT_CORRECT(email));
    }

    return {
        email: user.email,
        token: generateToken(user.email),
        status: 'success',
        isTeacher: isTeacher,
    };
}

async function signup(payload: User): Promise<RegisterUser> {
    const email = payload.email.toLowerCase();
    const isTeacher = payload.isTeacher;

    const accountCollection = isTeacher
        ? MongoDB.getTeacherAccountCollection()
        : MongoDB.getAccountCollection();

    const OHCollection = isTeacher
        ? MongoDB.getTeacherOHCollection()
        : MongoDB.getStudentOHCollection();

    const existingUser = await findUserByEmail(accountCollection, email);

    if (existingUser) {
        throw new HttpError(status.FORBIDDEN, error.USER_ALREADY_EXISTS(email));
    }

    await createNewUser(accountCollection, { email, password: payload.password, isTeacher });
    await createEmptyOH(OHCollection, email);

    return {
        email: email,
        token: generateToken(email),
        status: 'success',
        isTeacher: isTeacher,
    };
}

async function resetPassword(payload: ResetUser): Promise<RegisterUser> {
    const email = payload.email.toLowerCase();
    const isTeacher = payload.isTeacher;

    const accountCollection = isTeacher
        ? MongoDB.getTeacherAccountCollection()
        : MongoDB.getAccountCollection();

    const user = await findUserByEmail(accountCollection, email);

    if (!user) {
        throw new HttpError(status.NOT_FOUND, error.USER_NOT_FOUND(email));
    }

    const isPasswordCorrect: boolean = await validatePassword(payload.oldPassword, user.password);
    if (!isPasswordCorrect) {
        throw new HttpError(status.UNAUTHORIZED, error.USER_PASSWORD_NOT_CORRECT(email));
    }

    const hashedNewPassword = await bcrypt.hash(payload.newPassword, 10);
    await accountCollection.updateOne({ email: email }, { $set: { password: hashedNewPassword } });

    return {
        email: email,
        token: generateToken(email),
        status: 'success',
        isTeacher: isTeacher,
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

async function createEmptyOH(OHCollection: Collection<OfficeHourList>, email: string) {
    const emptyOH: OfficeHourList = {
        email: email,
        officeHourId: [],
    };
    await OHCollection.insertOne(emptyOH);
}

export { login, signup, resetPassword };
