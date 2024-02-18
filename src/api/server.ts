import express, { Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import 'dotenv/config';
import routes from './routes/routes.js';
import http from 'http';
import { setupSocketServer } from './services/queue/socketServer.js';

const app = express();
const server = http.createServer(app);
setupSocketServer(server);

/**
 * Dependencies configurations
 */

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("../assets"));
app.use(routes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello, world!' });
});

/**
 * Server Listening for connections
 */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`the server is running on port ${PORT}`);
});
