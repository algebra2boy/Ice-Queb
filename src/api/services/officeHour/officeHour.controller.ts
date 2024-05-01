import { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import * as officeHourService from './officeHour.service.js';

export const getOfficeHourList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.query.email as string;
        const isTeacher = req.query.isTeacher as string | undefined

        const officeHourList = await officeHourService.getAllOfficeHourByEmail(email, isTeacher)
        
        res.status(status.OK).json(officeHourList);
    } catch (error) {
        next(error);
    }
};

export const searchOfficeHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const officeHourList = await officeHourService.searchOfficeHour(
            req.query.facultyName as string,
            req.query.courseName as string,
            parseInt(req.query.searchLimit as string),
        );
        res.status(status.OK).json(officeHourList);
    } catch (error) {
        next(error);
    }
};

export const addOfficeHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const officeHourInfo = await officeHourService.addOfficeHourToStudentList(
            req.params.officeHourID as string,
            req.auth.user.email as string,
        );
        res.status(status.CREATED).json(officeHourInfo);
    } catch (error) {
        next(error);
    }
};

export const removeOfficeHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const officeHourList = await officeHourService.removeOfficeHourFromStudentList(
            req.params.officeHourID as string,
            req.auth.user.email as string,
        );
        res.status(status.OK).json(officeHourList);
    } catch (error) {
        next(error);
    }
};

export const uploadOfficeHour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uploadResult = await officeHourService.uploadOfficeHour(req.body);
        res.status(status.OK).json(uploadResult);
    } catch (error) {
        next(error);
    }
};
