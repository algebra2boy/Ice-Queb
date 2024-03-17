import { Collection } from 'mongodb';
import status from 'http-status';

import { DatabaseCollection } from '../../configs/constants.config.js';
import { ErrorMessages as error } from '../../configs/errorsMessage.config.js';
import { MongoDB } from '../../configs/database.config.js';
import { AccountClass, Class, StudentOfficeHour, OfficeHour } from './officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';

async function getAllOHByStudentEmail(email: string): Promise<[OfficeHour]> {
    const officeHourCollection: Collection<StudentOfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    const studentOfficeHourDocument = await officeHourCollection.findOne({ email: email });

    if (!studentOfficeHourDocument) {
        throw new HttpError(status.NOT_FOUND, error.OFFICE_HOUR_STUDENT_DOCUMENT_NOT_FOUND(email));
    }

    if (!studentOfficeHourDocument.officeHours) {
        throw new HttpError(status.NOT_FOUND, error.STUDENT_OFFICE_HOUR_NOT_FOUND(email));
    }

    return studentOfficeHourDocument.officeHours;
}

async function publishAllClassByStudentEmail(classSession: Class, emails: string[]) {
    const officeHourCollection: Collection<AccountClass> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    const failedEmails: string[] = [];

    for (const email of emails) {
        const failedEmail: string | undefined = await updateClassByEmail(
            officeHourCollection,
            classSession,
            email,
        );

        if (failedEmail !== undefined) {
            failedEmails.push(failedEmail);
        }
    }

    return failedEmails;
}

////////////////////////////////////////////////////////////////////////////////
//////////////////  HELPER FUNCTIONS FOR THE OFFICE HOUR SERVICES    ///////////
////////////////////////////////////////////////////////////////////////////////
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

export { getAllOHByStudentEmail, publishAllClassByStudentEmail };
