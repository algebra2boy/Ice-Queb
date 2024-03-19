import { Router } from 'express';

import AuthRouter from '../services/auth/auth.routes.js';
import OfficeHourRouter from '../services/officeHour/officeHour.routes.js';

const router = Router();

router.use('/auth', AuthRouter);
router.use('/officehour', OfficeHourRouter);

export default Router().use('/api', router);
