import { Router } from 'express';

import * as authController from './auth.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import { authSchema } from '../../validations/auth.validation.js';

const router = Router();

router.post('/login', validate(authSchema), authController.login);
router.post('/signup', validate(authSchema), authController.signup);

//TODO: Add a forget password route

export default router;
