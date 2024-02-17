import { Request, Response } from "express";

const getQueueInfo = (req: Request, res: Response) => {
    res.json(2);
};


const joinQueue = (req: Request, res: Response) => {
    res.json(3);
};

const leaveQueue = (req: Request, res: Response) => {
    res.json(4);
};

export default {
    getQueueInfo,
    joinQueue,
    leaveQueue
}