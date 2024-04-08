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

    const queueCollection = MongoDB.getQueueCollection();

    // set up change steam (do we need change stream???
    // const changeStream = queueCollection.watch();

    // changeStream.on('change', change => {
    //     console.log('Change occurred:', change);

    //     // Emit the change to connected clients
    //     io.emit('change', change); // Modify this according to your application's needs
    // });

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('join queue', async data => {
            const { studentEmail, officeHourID } = data;
            try {
                const targetQueue = await findTargetQueue(officeHourID);

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
                    io.to(socket.id).emit('joined queue', 0);
                    return;
                }

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

                io.to(socket.id).emit('joined queue', pplInQueue);
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('leave queue', async data => {
            const { studentEmail, officeHourID } = data;
            try {
                const targetQueue = await findTargetQueue(officeHourID);
                if (!targetQueue) {
                    io.to(socket.id).emit('failed leaving queue', 'No such queue is found');
                    return;
                }

                const studentsInQueue = targetQueue.studentList;
                const targetIdx = studentsInQueue.findIndex(
                    student => student.email === studentEmail,
                );

                if (targetIdx === -1) {
                    io.to(socket.id).emit(
                        'failed leaving queue',
                        'Student is not found in the queue',
                    );
                    return;
                }

                studentsInQueue.splice(targetIdx, 1);

                if (studentsInQueue.length === 0) {
                    await queueCollection.deleteOne({ queueId: officeHourID });
                }

                studentsInQueue.forEach((student, index) => {
                    student.position = index; // Adjust positions
                    if (index >= targetIdx) {
                        io.to(student.socketId).emit('update queue position', student.position);
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
