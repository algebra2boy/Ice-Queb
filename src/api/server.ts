import app from './app.js';
import { setupSocketServer } from './configs/socketServer.config.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`the server is running on port ${PORT}`);
    }
});

setupSocketServer(server);

export default server;
