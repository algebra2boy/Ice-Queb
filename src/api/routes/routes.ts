import { Router } from 'express';

import AuthRouter from '../services/auth/auth.routes.js';
import ClassRouter from '../services/class/class.routes.js';

const router = Router();

router.use('/auth', AuthRouter);
router.use('/class', ClassRouter);

export default Router().use('/api', router);
