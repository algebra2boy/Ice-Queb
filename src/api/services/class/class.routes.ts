import { Router } from "express";
import classContoller from "./class.controller.js";

const router = Router();

router.get('/list', classContoller.getClassList);

export default router;