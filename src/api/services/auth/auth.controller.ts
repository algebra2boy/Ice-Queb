import { Request, Response } from 'express';

export const login = (req: Request, res: Response) => {
    res.json({ message: 'login' });
};

export const signup = (req: Request, res: Response) => {
    res.json({ message: 'signup' });
};
