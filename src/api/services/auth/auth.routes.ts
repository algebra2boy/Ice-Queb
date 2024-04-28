import { Router } from 'express';

import * as authController from './auth.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import { authSchema, resetAuthSchema } from '../../validations/auth.validation.js';

const router = Router();

router.post('/login', validate(authSchema), authController.login);
router.post('/signup', validate(authSchema), authController.signup);
router.post('/reset', validate(resetAuthSchema), authController.resetPassword);

//TODO: Add a forget password route

export default router;
