import { Collection, UpdateResult } from 'mongodb';
import status from 'http-status';
import { v4 as uuidv4 } from 'uuid';

import { MongoDB } from '../../configs/database.config.js';
import { DBCollection } from '../../configs/constants.config.js';
import { ErrorMessages as error } from '../../configs/errorsMessage.config.js';
import {
    StudentOfficeHourList,
    OfficeHour,
    OfficeHourId,
    OfficeHourWithoutID,
} from './officeHour.model.js';
import { HttpError } from '../../utils/httpError.util.js';
import { departmentTranslation } from '../../utils/departmentTranslation.util.js';
import { shuffleArray } from '../../utils/fisher-yates-shuffle.js';

async function getAllOfficeHourByStudentEmail(email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getStudentOHCollection();

    // get office hour ID that belongs to student
    const officeHourIDs: string[] = await getOfficeHourIDByEmail(
        studentOfficeHourCollection,
        email,
    );

    const officeHourCollection: Collection<OfficeHour> = MongoDB.getIceQuebDB().collection(
        DBCollection.OfficeHour,
    );

    // find document whose id contains any office hour id from officeHourIDs
    // add projection to exclude _id field
    const officeHoursCursor = officeHourCollection.find(
        { id: { $in: officeHourIDs } },
        { projection: { _id: 0 } },
    );
    const officeHours: OfficeHour[] = await officeHoursCursor.toArray();

    return {
        email,
        officeHours,
        status: 'success',
    };
}

async function searchOfficeHour(facultyName: string, courseName: string, searchLimit: number = 10) {
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getOHCollection();

    // split courseName into courseDepartment and courseNumber
    const [, courseDepartment, courseNumber] = courseName
        ? courseName.match(/^([a-zA-Z]+)?(\d+[a-zA-Z]*)?$/) ?? ['', '']
        : ['', ''];

    // eliminate the empty searching arguments (the ones that the user left empty with)
    const searchQuery = defineSearchQuery(facultyName, courseDepartment, courseNumber);

    const searchProjection = { projection: { _id: 0 } };

    const searchResult = await officeHourCollection.find(searchQuery, searchProjection).toArray();

    if (facultyName === '""' && courseName === '""') {
        console.log('Shuffling search result');
        const randomSearchResult: OfficeHour[] = shuffleArray(searchResult);
        return {
            searchResult:
                randomSearchResult.length > searchLimit
                    ? randomSearchResult.slice(0, searchLimit)
                    : randomSearchResult,
            status: 'success',
        };
    }

    return {
        searchResult,
        status: 'success',
    };
}

async function addOfficeHourToStudentList(officeHourId: string, email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getStudentOHCollection();
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getOHCollection();

    await checkOfficeHourIDExistence(officeHourCollection, officeHourId);

    const filter = { email }; // filter by email
    const update = { $addToSet: { officeHourId: officeHourId } };
    const option = { upsert: true }; // if no document matches the filter, a new document will be created

    const updateResult = await studentOfficeHourCollection.updateOne(filter, update, option);

    return returnAddOfficeHourResult(updateResult, officeHourId, email);
}

async function removeOfficeHourFromStudentList(officeHourID: string, email: string) {
    const studentOfficeHourCollection: Collection<StudentOfficeHourList> =
        MongoDB.getStudentOHCollection();
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getOHCollection();

    await checkOfficeHourIDExistence(officeHourCollection, officeHourID);

    const officeHourIDs: string[] = await getOfficeHourIDByEmail(
        studentOfficeHourCollection,
        email,
    );
    const newofficeHourIDs: string[] = officeHourIDs.filter(
        (id: OfficeHourId) => id !== officeHourID,
    );

    const filter = { email: email };
    const newStudentOfficeHourDocument: StudentOfficeHourList = {
        email: email,
        officeHourId: newofficeHourIDs,
    };
    const update = { $set: newStudentOfficeHourDocument };

    await studentOfficeHourCollection.updateOne(filter, update);

    return { status: 'success' };
}

async function uploadOfficeHour(payload: OfficeHourWithoutID) {
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getOHCollection();

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

    // create a new copy of officeHourToUpload
    // because insertOne will automatically add _id field to the object
    // therefore we need to create a new object to avoid modifying the original object
    await officeHourCollection.insertOne({ ...officeHourToUpload });

    return {
        officeHourToUpload,
        status: 'success',
    };
}

async function editOfficeHour(payload: OfficeHour) {
    const officeHourCollection: Collection<OfficeHour> = MongoDB.getOHCollection();

    const payloadWithAbbreviatedCourseDepartment = {
        ...payload,
        courseDepartment: departmentTranslation[payload.courseDepartment],
    };

    const officeHourDocument = await officeHourCollection.findOne({ id: payload.id });

    if (!officeHourDocument) {
        throw new HttpError(status.BAD_REQUEST, error.OFFICE_HOUR_NOT_FOUND);
    }

    await officeHourCollection.updateOne(
        { id: officeHourDocument.id },
        { $set: payloadWithAbbreviatedCourseDepartment },
    );

    return {
        officeHourToEdit: payloadWithAbbreviatedCourseDepartment,
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
        throw new HttpError(status.BAD_REQUEST, error.OFFICE_HOUR_ID_DOES_NOT_EXISTS(officeHourId));
    }
}

function returnAddOfficeHourResult(
    updateResult: UpdateResult<StudentOfficeHourList>,
    officeHourId: string,
    email: string,
) {
    // Document did not exist before, so it was inserted.
    if (updateResult.matchedCount === 0) {
        return {
            message: `A new student office hour document has been created for ${email} with the officeHourID ${officeHourId}.`,
            status: 'success',
        };

        // Document was found, but the officeHourId was not added because it already exists.
    } else if (updateResult.modifiedCount === 0) {
        throw new HttpError(
            status.BAD_REQUEST,
            error.OFFICE_HOUR_ID_DUPLICATED(officeHourId, email),
        );

        // Document was found and the officeHourId was added successfully.
    } else {
        return {
            message: `The officeHourID ${officeHourId} has been added to ${email}'s student office hour document successfully.`,
            status: 'success',
        };
    }
}

function defineSearchQuery(facultyName: string, courseDepartment: string, courseNumber: string) {
    const searchParams = [];
    if (facultyName && facultyName !== '""') {
        searchParams.push({ facultyName: new RegExp('.*' + facultyName + '.*', 'i') });
    }
    if (courseDepartment && courseDepartment !== '""') {
        searchParams.push({ courseDepartment: new RegExp('.*' + courseDepartment + '.*', 'i') });
    }
    if (courseNumber && courseNumber !== '""') {
        searchParams.push({ courseNumber: new RegExp('.*' + courseNumber + '.*', 'i') });
    }

    return searchParams.length > 0 ? { $and: searchParams } : {};
}

export {
    getAllOfficeHourByStudentEmail,
    searchOfficeHour,
    addOfficeHourToStudentList,
    removeOfficeHourFromStudentList,
    uploadOfficeHour,
    editOfficeHour
};
