import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { MongoDB } from '../../configs/database.config.js';

// import { Queue, StudentInQueue } from './queue.model.js';

export function setupSocketServer(server: http.Server): SocketIOServer {
    const io: SocketIOServer = new SocketIOServer(server);

    const queueCollection = MongoDB.getQueueCollection();

    // set up change steam
    const changeStream = queueCollection.watch();

    changeStream.on('change', change => {
        console.log('Change occurred:', change);

        // Emit the change to connected clients
        io.emit('change', change); // Modify this according to your application's needs
    });

    // io.on('connection', socket => {
    //     console.log('A client connected');

    //     socket.on('disconnect', () => {
    //         console.log('A client disconnected');
    //     });
    // });

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('join queue', data => {
            // const { studentEmail, className, sessionNumber, day, startTime } = data;

            try {
                io.to(socket.id).emit('joined queue', 1);
            } catch (err) {
                console.error(err);
            }
        });
    });

    return io;
}
