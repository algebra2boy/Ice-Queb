import { Request, Response } from 'express';
import { Queue, StudentInQueue } from './queue.model.js';
import status from 'http-status';
import { HttpError } from '../../utils/httpError.util.js';

// For testing, will be replaced by actual database
import fs from 'fs/promises';
import path from 'path';

const ASSETS_FOLDER = path.resolve(process.cwd(), 'src/assets');

// temporary helper functions
const loadQueues = async () => {
    try {
        const data = await fs.readFile(path.resolve(ASSETS_FOLDER, 'queues.json'), 'utf8');
        const queues = JSON.parse(data);
        return queues;
    } catch (err) {
        console.log(err);
    }
};
const updateQueues = async (newQueues: Queue[]) => {
    try {
        const data = JSON.stringify(newQueues);
        await fs.writeFile(path.resolve(ASSETS_FOLDER, 'queues.json'), data, 'utf8');
    } catch (err) {
        console.log(err);
    }
};



const findTargetQueue = (payload: Queue, queue: Queue) => {
    const { className, sessionNumber, day, startTime } = payload;
    return (
        queue.className === className &&
        queue.sessionNumber === sessionNumber &&
        queue.day === day &&
        queue.startTime === startTime
    );
};

// Router functions
export const getQueueInfo = async (req: Request, res: Response) => {
    // const { className, sessionNumber, day, startTime } = req.body;

    // will be replaced by actual database
    const queues = await loadQueues();

    // const targetQueue = findTargetQueue(req.body, queue);

    const targetQueue = queues.find((queue: Queue) => {
        return findTargetQueue(req.body, queue);
    });

    console.log(targetQueue);

    if (targetQueue) {
        res.json(targetQueue);
    } else {
        throw new HttpError(status.NOT_FOUND, {
            message: 'no such queue is found',
            status: 'failure',
        });
    }
};

export const joinQueue = async (req: Request, res: Response) => {
    const { studentEmail } = req.body;

    // will be replaced by actual database
    const queues = await loadQueues();

    const targetQueue = queues.find((queue: Queue) => {
        return findTargetQueue(req.body, queue);
    });

    if (targetQueue) {
        targetQueue.studentList.push({ studentEmail, joinTime: new Date() });

        // will be replaced by actual database
        await updateQueues(queues);

        res.json({ status: 'Success' });
    } else {
        throw new HttpError(status.NOT_FOUND, {
            message: 'no such queue is found',
            status: 'failure',
        });
    }
};

export const leaveQueue = async (req: Request, res: Response) => {
    const { studentEmail } = req.body;

    // will be replaced by actual database
    const queues = await loadQueues();

    const targetQueue = queues.find((queue: Queue) => {
        return findTargetQueue(req.body, queue);
    });

    if (targetQueue) {
        let targetIdx = -1;

        targetQueue.studentList.forEach((student: StudentInQueue, idx: number) => {
            if (student.email === studentEmail) {
                targetIdx = idx;
                return true;
            } else {
                return false;
            }
        });

        targetQueue.studentList.splice(targetIdx, 1);

        // will be replaced by actual database
        await updateQueues(queues);

        res.json({ status: 'Success' });
    } else {
        throw new HttpError(status.NOT_FOUND, {
            message: 'no such queue is found',
            status: 'failure',
        });
    }
};
