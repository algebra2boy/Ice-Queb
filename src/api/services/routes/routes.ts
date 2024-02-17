import { Router } from 'express';

import AuthRouter from '../auth/auth.routes.js';
import ClassRouter from '../class/class.routes.js';
import QueueRouter from "../queue/queue.routes.js";

const router = Router();

router.use('/auth', AuthRouter);
router.use('/class', ClassRouter);
router.use('/queue', QueueRouter);


export default Router().use('/api', router);
