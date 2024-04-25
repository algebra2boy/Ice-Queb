import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { MongoDB } from '../../configs/database.config.js';

export function setupSocketServer(server: http.Server): SocketIOServer {
    const io: SocketIOServer = new SocketIOServer(server, {
        connectionStateRecovery: {
            // the backup duration of the sessions and the packets
            maxDisconnectionDuration: 2 * 60 * 1000,
            // whether to skip middlewares upon successful recovery
            skipMiddlewares: true,
        },
    });

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('check existence', async data => {
            const { studentEmail, officeHourID } = data;

            const queueCollection = MongoDB.getQueueCollection();

            try {
                const targetQueue = await findTargetQueue(officeHourID);
                // Check if the student is already in the queue (in case he/she disconnects from the server by accident)

                if (targetQueue) {
                    const existedStudent = targetQueue.studentList.find(
                        student => student.email === studentEmail,
                    );

                    // If the student is in the queue, update his/her socketid to "reconnect" him/her back to the server
                    if (existedStudent) {
                        existedStudent.socketId = socket.id;
                        await queueCollection.updateOne(
                            { queueId: officeHourID },
                            { $set: { studentList: targetQueue.studentList } },
                        );
                        socket.emit('check existence response', {
                            status: 'success',
                            data: {isInQueue: true, position: existedStudent.position},
                            error: null,
                        });
                    } else {
                        socket.emit('check existence response', {
                            status: 'success',
                            data: { isInQueue: false, position: targetQueue.studentList.length},
                            error: null,
                        });
                    }
                } else {
                    socket.emit('check existence response', {
                        status: 'success',
                        data: { isInQueue: false, position: 0 },
                        error: 'Queue does not exist',
                    });
                }
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('join queue', async data => {
            const { studentEmail, officeHourID } = data;

            const queueCollection = MongoDB.getQueueCollection();

            try {
                const targetQueue = await findTargetQueue(officeHourID);

                // Create an new queue when there is none
                if (!targetQueue) {
                    const queueCollection = MongoDB.getQueueCollection();
                    
                    await queueCollection.insertOne({
                        queueId: officeHourID,
                        studentList: [
                            {
                                socketId: socket.id,
                                email: studentEmail,
                                joinTime: new Date(),
                                position: 0,
                            },
                        ],
                    });
                    io.to(socket.id).emit('join queue response', {
                        status: 'success',
                        data: 0,
                        error: null,
                    });
                    return;
                }

                // Add student to the queue
                const pplInQueue = targetQueue.studentList.length;
                targetQueue.studentList.push({
                    socketId: socket.id,
                    email: studentEmail,
                    joinTime: new Date(),
                    position: pplInQueue,
                });

                // Save the updated queue document
                await queueCollection.updateOne(
                    { queueId: officeHourID },
                    { $set: { studentList: targetQueue.studentList } },
                );

                io.to(socket.id).emit('join queue response', {
                    status: 'success',
                    data: pplInQueue,
                    error: null,
                });
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('leave queue', async data => {
            const { studentEmail, officeHourID } = data;

            const queueCollection = MongoDB.getQueueCollection();

            try {
                const targetQueue = await findTargetQueue(officeHourID);
                if (!targetQueue) {
                    io.to(socket.id).emit('leave queue response', {
                        status: 'failure',
                        data: null,
                        error: 'No such queue is found',
                    });
                    return;
                }

                const studentsInQueue = targetQueue.studentList;
                const targetIdx = studentsInQueue.findIndex(
                    student => student.email === studentEmail,
                );

                if (targetIdx === -1) {
                    io.to(socket.id).emit('leave queue response', {
                        status: 'failure',
                        data: null,
                        error: 'Student is not found in the queue',
                    });
                    return;
                }

                studentsInQueue.splice(targetIdx, 1);

                // Remove the queue after everyone has left
                if (studentsInQueue.length === 0) {
                    await queueCollection.deleteOne({ queueId: officeHourID });
                }

                studentsInQueue.forEach((student, index) => {
                    student.position = index; // Adjust positions
                    if (index >= targetIdx) {
                        io.to(student.socketId).emit('leave queue response', {
                            status: 'success',
                            data: student.position,
                            error: null,
                        });
                    }
                });

                await queueCollection.updateOne(
                    { queueId: officeHourID },
                    { $set: { studentList: studentsInQueue } },
                );
            } catch (err) {
                console.error(err);
            }
        });
    });

    return io;
}

async function findTargetQueue(officeHourID: string) {
    try {
        const queueCollection = MongoDB.getQueueCollection();
        return await queueCollection.findOne({ queueId: officeHourID });
    } catch (err) {
        console.error('Error finding target queue:', err);
        throw err;
    }
}
