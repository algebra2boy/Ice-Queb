import { Router } from 'express';

import AuthRouter from '../services/auth/auth.routes.js';
import OfficeHourRouter from '../services/officeHour/officeHour.routes.js';

import { authLimiter } from '../middlewares/RateLimter.middleware.js';
import { officeHourLimiter } from '../middlewares/RateLimter.middleware.js';

const router = Router();

router.use('/auth', authLimiter, AuthRouter);
router.use('/officeHour', officeHourLimiter, OfficeHourRouter);

export default Router().use('/api', router);
