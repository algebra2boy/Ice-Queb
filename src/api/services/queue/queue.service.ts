import status from 'http-status';
import { Queue, StudentInQueue } from './queue.model.js';
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
        const data = JSON.stringify(newQueues, null, 4); // add indentation helps visualizing much better 
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
export const getQueueInfo = async (userQueueInfo: Queue) => {

    // will be replaced by actual database
    const queues = await loadQueues();

    const targetQueue = queues.find((queue: Queue) => {
        return findTargetQueue(userQueueInfo, queue);
    });

    if (!targetQueue) {
        throw new HttpError(status.NOT_FOUND, 'no such queue is found');
    }

    return targetQueue;
};

export const joinQueue = async (userQueueInfo: Queue, email: string) => {

    // will be replaced by actual database
    const queues = await loadQueues();

    const targetQueue = queues.find((queue: Queue) => {
        return findTargetQueue(userQueueInfo, queue);
    });

    if (!targetQueue) {
        throw new HttpError(status.NOT_FOUND, 'no such queue is found');
    }

    targetQueue.studentList.push({ email, joinTime: new Date() });

    // will be replaced by actual database
    await updateQueues(queues);

    return {
        message: `${email} has joined the queue`,
        status: 'Success'
    };
};

export const leaveQueue = async (userQueueInfo: Queue, email: string) => {

    // will be replaced by actual database
    const queues = await loadQueues();

    const targetQueue = queues.find((queue: Queue) => {
        return findTargetQueue(userQueueInfo, queue);
    });

    if (!targetQueue) {
        throw new HttpError(status.NOT_FOUND, 'no such queue is found');
    }

    // @ts-ignore
    let targetIdx = targetQueue.studentList.findIndex(student => student.email === email);

    targetQueue.studentList.splice(targetIdx, 1);

    // will be replaced by actual database
    await updateQueues(queues);

    return {
        message: `${email} has left the queue`,
        status: 'Success'
    };
};