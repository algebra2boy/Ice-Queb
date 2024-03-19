import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import * as officeHourService from './officeHour.service.js';

export const getOfficeHourList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const officeHourList = await officeHourService.getAllOfficeHourByStudentEmail(
            req.query.email as string,
        );
        res.status(status.OK).json(officeHourList);
    } catch (error) {
        next(error);
    }
};

export const uploadOfficeHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uploadResult = await officeHourService.uploadOfficeHour(req.body);

        if (uploadResult) {
            uploadResult;
            res.status(status.OK).json(uploadResult);
        } else {
            res.status(status.OK).json({ officeHourExists: 'Office Hour already exists'});
        }
    } catch (error) {
        next(error);
    }
};
