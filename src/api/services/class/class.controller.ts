import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import * as classService from './class.service.js';

export const getClassList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const classList = await classService.getAllClassByStudentEmail(req.query.email as string);
        res.status(status.OK).json(classList);
    } catch (error) {
        next(error);
    }
};
