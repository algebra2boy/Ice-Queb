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

export const publishClassList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const failedEmails = await classService.publishAllClassByStudentEmail(
            req.body.classSession,
            req.body.emails,
        );

        if (failedEmails.length > 0) {
            res.status(status.OK).json({ failedEmails: failedEmails });
        } else {
            res.status(status.OK).json({ status: 'success' });
        }
    } catch (error) {
        next(error);
    }
};
