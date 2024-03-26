import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import Queue, { QueueDocument } from '../services/queue/queue.model.js';

mongoose.connect('mongodb://localhost:27017/iceque')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

export function setupSocketServer(server: http.Server): SocketIOServer {
    const io: SocketIOServer = new SocketIOServer(server);

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('join queue', async data => {
            const { studentEmail, className, sessionNumber, day, startTime } = data;
            try {
                const targetQueue = await findTargetQueue(className, sessionNumber, day, startTime);
                if (!targetQueue) {
                    io.to(socket.id).emit('failed joining queue', 'No such queue is found');
                    return;
                }

                const pplInQueue = targetQueue.studentList.length;
                targetQueue.studentList.push({
                    socketId: socket.id,
                    email: studentEmail,
                    joinTime: new Date(),
                    position: pplInQueue
                });

                await targetQueue.save(); // Save the updated queue document

                io.to(socket.id).emit('joined queue', pplInQueue);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('leave queue', async data => {
            const { studentEmail, className, sessionNumber, day, startTime } = data;
            try {
                const targetQueue = await findTargetQueue(className, sessionNumber, day, startTime);
                if (!targetQueue) {
                    io.to(socket.id).emit('failed leaving queue', 'No such queue is found');
                    return;
                }

                const studentsInQueue = targetQueue.studentList;
                const targetIdx = studentsInQueue.findIndex(student => student.email === studentEmail);

                if (targetIdx !== -1) {
                    studentsInQueue.splice(targetIdx, 1);
                    studentsInQueue.forEach((student, index) => {
                        student.position = index; // Adjust positions
                        if (index > targetIdx) {
                            io.to(student.socketId).emit('update queue position', student.position);
                        }
                    });

                    await targetQueue.save(); // Save the updated queue document
                }
            } catch (err) {
                console.error(err);
            }
        });
    });

    return io;
}

// Load all queues from the database
async function loadQueues() {
    try {
        return await Queue.find();
    } catch (err) {
        console.error('Error loading queues:', err);
        throw err; // Rethrow or handle as appropriate for your application
    }
}

// Update a specific queue in the database
async function updateQueues(id: string, updateData: Partial<QueueDocument>) {
    try {
        await Queue.findByIdAndUpdate(id, updateData, { new: true });
    } catch (err) {
        console.error('Error updating queue:', err);
        throw err;
    }
}

// Find a specific queue based on criteria
async function findTargetQueue(className: string, sessionNumber: string, day: string, startTime: string) {
    try {
        return await Queue.findOne({ className, sessionNumber, day, startTime });
    } catch (err) {
        console.error('Error finding target queue:', err);
        throw err;
    }
}
