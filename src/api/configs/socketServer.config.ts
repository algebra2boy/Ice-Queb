import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

// For testing, will be replaced by actual database
import fs from 'fs/promises';
import path from 'path';
import { Queue, StudentInQueue } from '../services/queue/queue.model.js';

const ASSETS_FOLDER = path.resolve(process.cwd(), 'src/assets');

// temporary helper functions
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
        const data = JSON.stringify(newQueues);
        await fs.writeFile(path.resolve(ASSETS_FOLDER, 'queues.json'), data, 'utf8');
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

        socket.on('join queue', async (studentEmail, className, sessionNumber, day, startTime) => {
            const queues = await loadQueues();

            const targetQueue = queues.find((queue: Queue) => {
                return (
                    queue.className === className &&
                    queue.sessionNumber === sessionNumber &&
                    queue.day === day &&
                    queue.startTime === startTime
                );
            });

            if (targetQueue) {
                const pplInQueue = targetQueue.studentList.length;
                targetQueue.studentList.push({
                    socketId: socket.id,
                    email: studentEmail,
                    joinTime: new Date(),
                    pos: pplInQueue,
                });

                // will be replaced by actual database
                await updateQueues(queues);

                io.to(socket.id).emit('joined queue', pplInQueue - 1);
            } else {
                io.to(socket.id).emit('failed joining queue', 'No such queue is found');
            }
        });

        socket.on('leave queue', async (studentEmail, className, sessionNumber, day, startTime) => {
            const queues = await loadQueues();

            const targetQueue = queues.find((queue: Queue) => {
                return (
                    queue.className === className &&
                    queue.sessionNumber === sessionNumber &&
                    queue.day === day &&
                    queue.startTime === startTime
                );
            });

            if (targetQueue) {
                const studentsInQueue = targetQueue.studentList;
                const targetIdx = studentsInQueue.findIndex(
                    (student: StudentInQueue) => student.email === studentEmail,
                );

                if (targetIdx !== -1) {
                    studentsInQueue.splice(targetIdx, 1);
                    for (let i = 0; i < studentsInQueue.length; i++) {
                        const currStudent = studentsInQueue[i];
                        if (i !== currStudent.pos) {
                            io.to(currStudent.socketId).emit("left queue", currStudent.pos - 1);
                            currStudent.pos = i;
                        }
                    }
                }

                // will be replaced by actual database
                await updateQueues(queues);
            } else {
                io.to(socket.id).emit('failed leaving queue', 'No such queue is found');
            }
        });
    });

    return io;
}
