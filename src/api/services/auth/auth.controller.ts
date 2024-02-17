import { Request, Response } from 'express';

const login = (req: Request, res: Response) => {
    res.json({ message: 'login' });
};

const signup = (req: Request, res: Response) => {
    res.json({ message: 'signup' });
};

export default {
    login,
    signup,
};
