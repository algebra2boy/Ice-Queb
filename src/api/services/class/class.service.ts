import { Collection } from 'mongodb';
import status from 'http-status';

import { MongoDB } from '../../configs/database.config.js';
import { AccountClass, Class } from './class.model.js';
import { HttpError } from '../../utils/httpError.util.js';

async function getAllClassByStudentEmail(email: string) {
    const classCollection: Collection<AccountClass> = MongoDB.getIceQuebDB().collection('class');

    const classes = getClassByEmail(classCollection, email);

    if (!classes) {
        throw new HttpError(status.NOT_FOUND, `classes are not found for ${email}`);
    }

    return classes;
}

async function publishAllClassByStudentEmail(classSession: Class, emails: string[]) {
    const classCollection: Collection<AccountClass> = MongoDB.getIceQuebDB().collection('class');

    const failedEmails: string[] = [];

    for (const email of emails) {
        const failedEmail: string | undefined = await updateClassByEmail(
            classCollection,
            classSession,
            email,
        );

        if (failedEmail !== undefined) {
            failedEmails.push(failedEmail);
        }
    }

    return failedEmails;
}

//
//  HELPER FUNCTION FOR CLASS SERVICE
//

async function getClassByEmail(
    classCollection: Collection<AccountClass>,
    email: string,
): Promise<[Class] | undefined> {
    const document = await classCollection.findOne({ email: email });

    if (!document) {
        throw new HttpError(status.NOT_FOUND, `no account-class document is found for ${email}`);
    }

    return document.classes;
}

async function updateClassByEmail(
    classCollection: Collection<AccountClass>,
    classSession: Class,
    email: string,
) {
    const document = await classCollection.findOne({ email: email });

    // Does not find the student's email
    if (!document) {
        return email;
    }

    // check if the student already has this class
    if (
        document.classes.every(
            (c: Class) =>
                c.className !== classSession.className ||
                c.sessionNumber !== classSession.sessionNumber,
        )
    ) {
        document.classes.push(classSession);
    } else {
        return;
    }

    await classCollection.updateOne({ email: email }, { $set: document });
}

export { getAllClassByStudentEmail, publishAllClassByStudentEmail };
