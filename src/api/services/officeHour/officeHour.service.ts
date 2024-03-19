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
