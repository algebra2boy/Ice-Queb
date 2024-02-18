import { Request, Response } from 'express';

export const getQueueInfo = (req: Request, res: Response) => {
    res.json(2);
};

export const joinQueue = (req: Request, res: Response) => {
    res.json(3);
};

export const leaveQueue = (req: Request, res: Response) => {
    res.json(4);
};
