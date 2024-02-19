import { Request, Response, NextFunction } from 'express';
import * as queueService from "./queue.service.js";
import status from "http-status";

export const getQueueInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const queue = queueService.getQueueInfo(req.body);
        res.status(status.OK).json(queue);
    } catch (error) {
        next(error);
    }
}

export const joinQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {

    } catch (error) {
        next(error);
    }
}

export const leaveQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {

    } catch (error) {
        next(error);
    }
}