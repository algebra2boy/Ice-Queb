import { Request, Response } from 'express';
import { Queue } from './queue.model.js';

// For testing, will be replaced by actual database 
import fs from 'fs/promises';
import path from 'path';

const ASSETS_FOLDER = path.resolve(process.cwd(), 'src/assets');

const loadQueues = async () => {
    try {
        const data = await fs.readFile(path.resolve(ASSETS_FOLDER, 'queues.json'), 'utf8');
        const queues = JSON.parse(data);
        return queues;
    } catch (err) {
        console.log(err);
    }
};

const getQueueInfo = async (req: Request, res: Response) => {
    const { className, sessionNumber, day, startTime } = req.query;

    const queues = await loadQueues();

    const targetedQueue = queues.find((queue: Queue) => {
        return (
            queue.className === className &&
            queue.sessionNumber === sessionNumber &&
            queue.day === day &&
            queue.startTime === startTime
        );
    });

    if (targetedQueue) {
        res.json(targetedQueue);
    } else {
        res.json({err: "No such queue is found"});
    }
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
    leaveQueue,
};
