import { Router } from 'express';
import * as officeHourController from './officeHour.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import {
    officeHourListSchema,
    officeHourUploadSchema,
} from '../../validations/officeHour.validation.js';

const router = Router();

router.get('/list', validate(officeHourListSchema), officeHourController.getOfficeHourList);
router.post('/upload', validate(officeHourUploadSchema), officeHourController.uploadOfficeHour);

//TODO: Add a managed class route for student

export default router;
