import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

export function setupSocketServer(server: http.Server): SocketIOServer { 
    const io: SocketIOServer = new SocketIOServer(server); 

    io.on('connection', socket => {
        console.log('A client connected');

        socket.on('disconnect', () => {
            console.log('A client disconnected');
        });

    });

    return io;
}
