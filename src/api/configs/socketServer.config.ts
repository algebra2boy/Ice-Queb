import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

// For testing, will be replaced by actual database
import fs from 'fs/promises';
import path from 'path';
import { Queue, StudentInQueue } from '../services/queue/queue.model.js';

const ASSETS_FOLDER = path.resolve(process.cwd(), 'src/assets');

// temporary helper functions
//TODO: TEST SOCKET SERVER
const loadQueues = async () => {
    try {
        const data = await fs.readFile(path.resolve(ASSETS_FOLDER, 'socketQueues.json'), 'utf8');
        const queues = JSON.parse(data);
        return queues;
    } catch (err) {
        console.log(err);
    }
};
const updateQueues = async (newQueues: Queue[]) => {
    try {
        const data = JSON.stringify(newQueues, null, 4);
        await fs.writeFile(path.resolve(ASSETS_FOLDER, 'socketQueues.json'), data, 'utf8');
    } catch (err) {
        console.log(err);
    }
};

export function setupSocketServer(server: http.Server): SocketIOServer {
    const io: SocketIOServer = new SocketIOServer(server);

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });

        socket.on('join queue', async data => {
            const { studentEmail, className, sessionNumber, day, startTime } = data;
            // console.log("joined ")
            console.log('socket.id' + socket.id);
            console.log('studentEmail' + studentEmail);
            console.log('className' + className);
            console.log('sessionNumber' + sessionNumber);
            console.log('day' + day);
            console.log('startTime' + startTime);

            const queues = await loadQueues();
            console.log(queues);
            const targetQueue = findTargetQueue(queues, className, sessionNumber, day, startTime);
            console.log(targetQueue);
            if (!targetQueue) {
                io.to(socket.id).emit('failed joining queue', 'No such queue is found');
                return;
            }

            const pplInQueue = targetQueue.studentList.length;
            targetQueue.studentList.push({
                socketId: socket.id,
                email: studentEmail,
                joinTime: new Date(),
                position: pplInQueue,
            });

            // will be replaced by actual database
            await updateQueues(queues);

            io.to(socket.id).emit('joined queue', pplInQueue - 1);
        });

        socket.on('leave queue', async data => {
            const { studentEmail, className, sessionNumber, day, startTime } = data;
            const queues = await loadQueues();

            const targetQueue = findTargetQueue(queues, className, sessionNumber, day, startTime);

            if (!targetQueue) {
                io.to(socket.id).emit('failed leaving queue', 'No such queue is found');
                return;
            }

            const studentsInQueue = targetQueue.studentList;
            const targetIdx = studentsInQueue.findIndex(
                (student: StudentInQueue) => student.email === studentEmail,
            );

            if (targetIdx !== -1) {
                studentsInQueue.splice(targetIdx, 1);
                for (let i = 0; i < studentsInQueue.length; i++) {
                    const currStudent = studentsInQueue[i];
                    if (i !== currStudent.position) {
                        io.to(currStudent.socketId).emit('left queue', currStudent.position - 1);
                        currStudent.position = i;
                    }
                }
            }

            // will be replaced by actual database
            await updateQueues(queues);
        });
    });

    return io;
}

function findTargetQueue(
    queues: Queue[],
    className: string,
    sessionNumber: string,
    day: string,
    startTime: string,
) {
    return queues.find((queue: Queue) => {
        return (
            queue.className === className &&
            queue.sessionNumber === sessionNumber &&
            queue.day === day &&
            queue.startTime === startTime
        );
    });
}
