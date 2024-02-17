import { Server as SocketIOServer } from 'socket.io'; // Importing the Server type from 'socket.io'
import http from 'http';

export function setupSocketServer(server: http.Server): SocketIOServer { // Explicitly specifying the return type as SocketIOServer
    const io: SocketIOServer = new SocketIOServer(server); // Explicitly annotating the type of io variable

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });
    });

    return io;
}
