import { Router } from 'express';
import * as classContoller from './class.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import { classListSchema, classPublishSchema } from '../../validations/class.validation.js';

const router = Router();

router.get('/list', validate(classListSchema), classContoller.getClassList);
router.post('/publish', validate(classPublishSchema), classContoller.publishClassList)

export default router;
