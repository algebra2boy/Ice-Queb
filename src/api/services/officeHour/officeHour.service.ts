import { Collection } from 'mongodb';
import status from 'http-status';

import { MongoDB } from '../../configs/database.config.js';
import { StudentOfficeHourList, OfficeHour, OfficeHourId } from './officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';

async function getAllOfficeHourByStudentEmail(email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getIceQuebDB().collection('StudentOfficeHour');

    const officeHours = getOfficeHourByEmail(studentOfficeHourCollection, email);

    if (!officeHours) {
        throw new HttpError(status.NOT_FOUND, `classes are not found for ${email}`);
    }

    return officeHours;
}

async function uploadOfficeHour(payload: OfficeHour) {
    const {
        id,
        facultyName,
        day,
        startDate,
        endDate,
        startTime,
        endTime,
        courseDepartment,
        courseNumber,
    } = payload;

    const officeHourToUpload: OfficeHour = {
        id,
        facultyName,
        day,
        startDate,
        endDate,
        startTime,
        endTime,
        courseDepartment,
        courseNumber,
    };

    const officeHourCollection: Collection<OfficeHour> =
        MongoDB.getIceQuebDB().collection('OfficeHour');

    const isOfficeHourExisted = await officeHourCollection.findOne(officeHourToUpload);

    if (isOfficeHourExisted === null) {
        await officeHourCollection.insertOne(officeHourToUpload);
        return officeHourToUpload;
    }
}

//
//  HELPER FUNCTION FOR CLASS SERVICE
//

async function getOfficeHourByEmail(
    studentOfficeHourCollection: Collection<StudentOfficeHourList>,
    email: string,
): Promise<[OfficeHourId] | undefined> {
    const document = await studentOfficeHourCollection.findOne({ email: email });

    if (!document) {
        throw new HttpError(
            status.NOT_FOUND,
            `no student office hour document is found for ${email}`,
        );
    }

    return document.officeHour;
}

export { getAllOfficeHourByStudentEmail, uploadOfficeHour };
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

    const studentOfficeHourDocument = await officeHourCollection.findOne({ studentEmail: email });

    if (!studentOfficeHourDocument) {
        throw new HttpError(status.NOT_FOUND, error.OFFICE_HOUR_STUDENT_DOCUMENT_NOT_FOUND(email));
    }

    if (!studentOfficeHourDocument.officeHour) {
        throw new HttpError(status.NOT_FOUND, error.STUDENT_OFFICE_HOUR_NOT_FOUND(email));
    }

    return studentOfficeHourDocument.officeHour;
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
