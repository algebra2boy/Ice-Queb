import { Collection } from 'mongodb';
import status from 'http-status';
import bcrypt from 'bcrypt';

import { MongoDB } from '../../configs/database.config.js';
import { ErrorMessages as error } from '../../configs/errorsMessage.config.js';
import { User, RegisterUser } from './auth.model.js';
import { StudentOfficeHourList } from '../officeHour/officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';
import { generateToken } from '../../utils/token.util.js';

async function login(payload: User): Promise<RegisterUser> {
    const accountCollection: Collection<User> = MongoDB.getAccountCollection();

    const email = payload.email.toLowerCase();

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
    };
}

async function signup(payload: User): Promise<RegisterUser> {
    const accountCollection: Collection<User> = MongoDB.getAccountCollection();
    const studentOHCollection: Collection<StudentOfficeHourList> = MongoDB.getStudentOHCollection();

    const email = payload.email.toLowerCase();

    const existingUser = await findUserByEmail(accountCollection, email);

    if (existingUser) {
        throw new HttpError(status.FORBIDDEN, error.USER_ALREADY_EXISTS(email));
    }

    await createNewUser(accountCollection, { email, password: payload.password });
    await createEmptyStudentOH(studentOHCollection, email);

    return {
        email: email,
        token: generateToken(email),
        status: 'success',
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
    });
}

async function validatePassword(payloadPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(payloadPassword, hashedPassword);
}

async function createEmptyStudentOH(
    studentOHCollection: Collection<StudentOfficeHourList>,
    email: string,
) {
    const emptyStudentOH: StudentOfficeHourList = {
        email: email,
        officeHourId: [],
    };
    await studentOHCollection.insertOne(emptyStudentOH);
}

export { login, signup };
