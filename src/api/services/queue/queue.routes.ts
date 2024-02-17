import { Router } from "express";
import queueController from "./queue.controller.js";

const router = Router();

router.get('/info', queueController.getQueueInfo);
router.post('/join', queueController.joinQueue);
router.delete('/leave', queueController.leaveQueue);

export default router;