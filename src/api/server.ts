import app from './app.js';
import { setupSocketServer } from './services/queue/queue.socket.js';
import { MongoDB } from './configs/database.config.js';
import * as https from 'https';
import * as fs from 'fs';

const PORT = process.env.PORT || 3000;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || 'certificate.crt';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || 'private.key';
const SSL_CA_BUNDLE_PATH = process.env.SSL_CA_BUNDLE_PATH || 'ca_bundle.crt';

const privateKey = fs.readFileSync(SSL_KEY_PATH, 'utf8');
const certificate = fs.readFileSync(SSL_CERT_PATH, 'utf8');
const caBundle = fs.readFileSync(SSL_CA_BUNDLE_PATH, 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: caBundle };

MongoDB.runServer();

const server = https.createServer(credentials, app);

server.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`The server is running on port ${PORT}`);
    }
});

setupSocketServer(server);

export default server;
