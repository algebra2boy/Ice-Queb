import { Router } from 'express';
import * as officeHourController from './officeHour.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import {
    officeHourListSchema,
    officeHourIDSchema,
    officeHourUploadSchema,
} from '../../validations/officeHour.validation.js';

import jwtMiddleware from '../../middlewares/JsonWebToken.middleware.js';

const router = Router();

// STUDENT ROUTE
router.get('/list', validate(officeHourListSchema), officeHourController.getOfficeHourList);
router.get('/search', officeHourController.searchOfficeHour);
router.post(
    '/add/:officeHourID',
    jwtMiddleware,
    validate(officeHourIDSchema),
    officeHourController.addOfficeHour,
);
router.delete(
    '/remove/:officeHourID',
    jwtMiddleware,
    validate(officeHourIDSchema),
    officeHourController.removeOfficeHour,
);

// TEACHER ROUTE
router.post('/upload', validate(officeHourUploadSchema), officeHourController.uploadOfficeHour);

export default router;
