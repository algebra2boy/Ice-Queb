import { Router } from 'express';
import * as classContoller from './class.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import { classListSchema, classPublishSchema } from '../../validations/class.validation.js';

const router = Router();

router.get('/list', validate(classListSchema), classContoller.getClassList);

// TODO: fix publish class list
router.post('/publish', validate(classPublishSchema), classContoller.publishClassList);

//TODO: Add a managed class route for student

export default router;
