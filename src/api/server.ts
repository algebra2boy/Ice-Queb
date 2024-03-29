import app from './app.js';
import { setupSocketServer } from './configs/socketServer.config.js';
import * as https from 'https';
import * as fs from 'fs';

const PORT = process.env.PORT || 3000;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || 'localhost.crt';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || 'localhost.key';

const privateKey = fs.readFileSync(SSL_KEY_PATH, 'utf8');
const certificate = fs.readFileSync(SSL_CERT_PATH, 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app);

server.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`HTTPS server running on port ${PORT}`);
    }
});

setupSocketServer(server);

export default server;
