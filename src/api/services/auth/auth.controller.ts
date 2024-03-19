import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import * as userService from './auth.service.js';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.login(req.body);
        res.status(status.OK).json(user);
    } catch (error) {
        next(error);
    }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.signup(req.body);
        res.status(status.CREATED).json(user);
    } catch (error) {
        next(error);
    }
};
