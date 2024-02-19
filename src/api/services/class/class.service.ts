import { Collection } from 'mongodb';
import status from 'http-status';

import { MongoDB } from '../../configs/database.config.js';
import { AccountClass, Class } from './class.model.js';
import { HttpError } from '../../utils/httpError.util.js';

async function getAllClassByStudentEmail(email: string) {
    const classCollection: Collection<AccountClass> = MongoDB.getIceQuebDB().collection('class');

    const classes = getClassbyEmail(classCollection, email);

    if (!classes) {
        throw new HttpError(status.NOT_FOUND, `classes are not found for ${email}`);
    }

    return classes;
}

//
//  HELPER FUNCTION FOR CLASS SERVICE
//

async function getClassbyEmail(
    classCollection: Collection<AccountClass>,
    email: string,
): Promise<[Class] | undefined> {
    const document = await classCollection.findOne({ email: email });

    if (!document) {
        throw new HttpError(status.NOT_FOUND, `no account-class document is found for ${email}`);
    }

    return document.classes;
}

export { getAllClassByStudentEmail };
