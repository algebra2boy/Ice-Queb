import { Collection, UpdateResult } from 'mongodb';
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
import { departmentTranslation } from '../../utils/departmentTranslation.util.js';

async function getAllOfficeHourByStudentEmail(email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getIceQuebDB().collection(DatabaseCollection.StudentOfficeHour);

    // get office hour ID that belongs to student
    const officeHourIDs: string[] = await getOfficeHourIDByEmail(
        studentOfficeHourCollection,
        email,
    );

    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    // find document whose id contains any office hour id from officeHourIDs
    const officeHoursCursor = officeHourCollection.find({ id: { $in: officeHourIDs } });
    const officeHours: OfficeHour[] = await officeHoursCursor.toArray();

    return {
        email,
        officeHours,
        status: 'success',
    };
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
        status: 'success',
        searchResult,
    };
}

async function addOfficeHourToStudentList(officeHourId: string, email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getIceQuebDB().collection(DatabaseCollection.StudentOfficeHour);
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    await checkOfficeHourIDExistence(officeHourCollection, officeHourId);

    const filter = { email }; // filter by email
    const update = { $addToSet: { officeHourId: officeHourId } };
    const option = { upsert: true }; // if no document matches the filter, a new document will be created

    const updateResult = await studentOfficeHourCollection.updateOne(filter, update, option);

    return returnAddOfficeHourResult(updateResult, officeHourId, email);
}

async function removeOfficeHourFromStudentList(officeHourID: string, email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getIceQuebDB().collection(DatabaseCollection.StudentOfficeHour);
    const officeHourIDs = await getOfficeHourIDByEmail(studentOfficeHourCollection, email);

    let newOfficeHourList: string[] = [];
    if (officeHourIDs !== undefined) {
        newOfficeHourList = officeHourIDs.filter((id: OfficeHourId) => id !== officeHourID);
    }

    console.log(newOfficeHourList);

    await studentOfficeHourCollection.updateOne(
        { email: email },
        { $set: { email, officeHour: newOfficeHourList as [string] } },
    );

    return { status: 'success' };
}

async function uploadOfficeHour(payload: OfficeHourPayload) {
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DatabaseCollection.OfficeHour,
    );

    const payloadWithAbbreviatedCourseDepartment = {
        ...payload,
        courseDepartment: departmentTranslation[payload.courseDepartment],
    };

    const officeHourDocument = await officeHourCollection.findOne(
        payloadWithAbbreviatedCourseDepartment,
    );

    if (officeHourDocument) {
        throw new HttpError(status.BAD_REQUEST, error.OFFICE_HOUR_ALREADY_EXISTS);
    }

    const officeHourToUpload: OfficeHour = {
        id: uuidv4(),
        ...payloadWithAbbreviatedCourseDepartment,
    };

    await officeHourCollection.insertOne(officeHourToUpload);

    return {
        officeHourToUpload,
        status: 'success',
    };
}

////////////////////////////////////////////////////////////////////////////////
//////////////////  HELPER FUNCTIONS FOR THE Office HOUR SERVICES    ///////////
////////////////////////////////////////////////////////////////////////////////
async function getOfficeHourIDByEmail(
    studentOfficeHourCollection: Collection<StudentOfficeHourList>,
    email: string,
): Promise<OfficeHourId[]> {
    const studentOfficeHourDocument = await studentOfficeHourCollection.findOne({ email: email });

    if (!studentOfficeHourDocument) {
        throw new HttpError(status.NOT_FOUND, error.STUDENT_OFFICE_HOUR_DOCUMENT_NOT_FOUND(email));
    }

    if (!studentOfficeHourDocument.officeHourId) {
        throw new HttpError(status.NOT_FOUND, error.STUDENT_OFFICE_HOUR_NOT_FOUND(email));
    }

    return studentOfficeHourDocument.officeHourId;
}

async function checkOfficeHourIDExistence(
    officeHourCollection: Collection<OfficeHour>,
    officeHourId: string,
) {
    const officeHourDocument = await officeHourCollection.findOne({ id: officeHourId });

    if (!officeHourDocument) {
        throw new HttpError(status.BAD_REQUEST, error.OFFICE_HOUR_ID_ALREADY_EXISTS(officeHourId));
    }
}

function returnAddOfficeHourResult(
    updateResult: UpdateResult<StudentOfficeHourList>,
    officeHourId: string,
    email: string,
) {
    if (updateResult.matchedCount === 0) {
        // Document did not exist before, so it was inserted.
        return {
            message: `The officeHourID ${officeHourId} has been added to ${email}'s student office hour document.`,
            status: 'success',
        };
    } else if (updateResult.modifiedCount === 0) {
        // Document was found, but the officeHourId was not added because it already exists.
        return {
            message: `The officeHourID ${officeHourId} is duplicated in the ${email} student office hour document.`,
            status: 'failure',
        };
    } else {
        // Document was found and the officeHourId was added successfully.
        return {
            message: `The officeHourID ${officeHourId} has been added to ${email}'s student office hour document successfully.`,
            status: 'success',
        };
    }
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
