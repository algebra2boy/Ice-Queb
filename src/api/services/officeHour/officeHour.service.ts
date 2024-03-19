import { Collection } from 'mongodb';
import status from 'http-status';
import { v4 as uuidv4 } from 'uuid';

import { MongoDB } from '../../configs/database.config.js';
import { DatabaseCollection } from '../../configs/constants.config.js';
import { ErrorMessages as error } from '../../configs/errorsMessage.config.js';
import {
    StudentOfficeHourList,
    OfficeHour,
    OfficeHourId,
    OfficeHourPayload,
} from './officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';

async function getAllOfficeHourByStudentEmail(email: string): Promise<OfficeHour[]> {

    // Get the student office hour collection and find the student office hour id by email
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getIceQuebDB().collection(DatabaseCollection.StudentOfficeHour);

    const officeHourIDs = await getOfficeHourIDByEmail(studentOfficeHourCollection, email);

    if (!officeHourIDs) {
        throw new HttpError(status.NOT_FOUND, error.STUDNET_OFFICE_HOUR_NOT_FOUND(email));
    }

    // Get the office hour collection and find the student office hour by id
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    const officeHours: OfficeHour[] = [];

    for (const officeHourID of officeHourIDs) {
        const officeHour = await officeHourCollection.findOne({ id: officeHourID });
        if (officeHour) {
            officeHours.push(officeHour);
        }
    }       

    return officeHours;  
}

async function uploadOfficeHour(payload: OfficeHourPayload): Promise<OfficeHour> {
    const officeHourToUpload: OfficeHour = {
        id: uuidv4(),
        ...payload,
    };

    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    const officeHourDocument = await officeHourCollection.findOne(payload);

    if (officeHourDocument) {
        throw new HttpError(status.BAD_REQUEST, error.OFFICE_HOUR_ALREADY_EXISTS);
    }

    await officeHourCollection.insertOne(officeHourToUpload);
    return officeHourToUpload;
}

////////////////////////////////////////////////////////////////////////////////
//////////////////  HELPER FUNCTIONS FOR THE Office HOUR SERVICES    ///////////
////////////////////////////////////////////////////////////////////////////////
async function getOfficeHourIDByEmail(
    studentOfficeHourCollection: Collection<StudentOfficeHourList>,
    email: string,
): Promise<[OfficeHourId] | undefined> {
    const studentOfficeHourDocument = await studentOfficeHourCollection.findOne({ email: email });

    if (!studentOfficeHourDocument) {
        throw new HttpError(status.NOT_FOUND, error.STUDENT_OFFICE_HOUR_DOCUMENT_NOT_FOUND(email));
    }

    return studentOfficeHourDocument.officeHour;
}

export { getAllOfficeHourByStudentEmail, uploadOfficeHour };
