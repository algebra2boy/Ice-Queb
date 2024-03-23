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
    OfficeHourSearchingArguments,
} from './officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';

async function getAllOfficeHourByStudentEmail(email: string): Promise<OfficeHour[]> {
    // Get the student office hour collection and find the student office hour id by email
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getIceQuebDB().collection(DatabaseCollection.StudentOfficeHour);

    const officeHourIDs = await getOfficeHourIDByEmail(studentOfficeHourCollection, email);

    if (!officeHourIDs) {
        throw new HttpError(status.NOT_FOUND, error.STUDENT_OFFICE_HOUR_NOT_FOUND(email));
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

async function searchOfficeHour(facultyName: string, courseName: string) {
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    // split courseName into courseDepartment and courseNumber
    const [, courseDepartment, courseNumber] = courseName
        ? courseName.match(/^([a-zA-Z]+)?(\d+[a-zA-Z]*)?$/) ?? ['', '']
        : ['', ''];

    // eliminate the empty searching arguments (the ones that the user left empty with)
    const searchArguments = defineSearchArguments(facultyName, courseDepartment, courseNumber);

    const searchResult = await officeHourCollection.find(searchArguments).toArray();

    if (!searchArguments) {
        throw new HttpError(status.NOT_FOUND, error.OFFICE_HOUR_NOT_FOUND);
    }

    return {
        success: 'searchOfficeHour',
        searchResult,
    };
}

async function addOfficeHourToStudentList(officeHourID: string, studentEmail: string) {
    return {
        success: 'addOfficeHourToStudentList',
        officeHourID: officeHourID,
        studentEmail: studentEmail,
    };
}

async function removeOfficeHourFromStudentList(officeHourID: string, email: string) {
    // const officeHourIDs = await getAllOfficeHourByStudentEmail(email);
    // const newOfficeHourIDs = officeHourIDs.filter((id: string) => id === officeHourID);
    return { success: 'removeOfficeHourFromStudentList', officeHourID: officeHourID };
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

function defineSearchArguments(
    facultyName: string,
    courseDepartment: string,
    courseNumber: string,
) {
    const searchArguments: OfficeHourSearchingArguments = {};
    if (facultyName) {
        searchArguments.facultyName = facultyName;
    }
    if (courseDepartment) {
        searchArguments.courseDepartment = courseDepartment;
    }
    if (courseNumber) {
        searchArguments.courseNumber = courseNumber;
    }
    return searchArguments;
}

export {
    getAllOfficeHourByStudentEmail,
    searchOfficeHour,
    addOfficeHourToStudentList,
    removeOfficeHourFromStudentList,
    uploadOfficeHour,
};
