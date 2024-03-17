import { Router } from 'express';
import * as officeHourContoller from './officeHour.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import {
    officeHourListSchema,
    officeHourPublishSchema,
} from '../../validations/officeHour.validation.js';

const router = Router();

router.get('/list', validate(officeHourListSchema), officeHourContoller.getOfficeHourList);

// TODO: fix publish class list
router.post(
    '/publish',
    validate(officeHourPublishSchema),
    officeHourContoller.publishOfficeHourList,
);

//TODO: Add a managed class route for student

export default router;
