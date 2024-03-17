import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import * as officeHourService from './officeHour.service.js';

export const getOfficeHourList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const officeHourList = await officeHourService.getAllOHByStudentEmail(
            req.query.email as string,
        );
        res.status(status.OK).json(officeHourList);
    } catch (error) {
        next(error);
    }
};

export const publishOfficeHourList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const failedEmails = await officeHourService.publishAllClassByStudentEmail(
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
