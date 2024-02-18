import { Router } from 'express';
import * as classContoller from './class.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import { classListSchema } from '../../validations/class.validation.js';

const router = Router();

router.get('/list', validate(classListSchema), classContoller.getClassList);

export default router;
