import { NextFunction, Request, Response } from 'express';
import * as userService from './auth.service.js';
import { HttpError } from '../../utils/httpError.util.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.login(req.body);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const signup = (req: Request, res: Response, next: NextFunction) => {
    try {
        throw new HttpError(400, {
            message: '123',
            status: 'failure',
        });
        res.json({ message: 'signup' });
    } catch (error) {
        next(error);
    }
};
