import { Router } from 'express';

import * as authController from './auth.controller.js';
import validate from '../../middlewares/Zod.middleware.js';
import { loginSchema, signupSchema } from '../../validations/auth.validation.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/signup', validate(signupSchema), authController.signup);

//TODO: Add a forget password route

export default router;
