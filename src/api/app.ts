import express, { Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';

import routes from './routes/routes.js';
import { setupSocketServer } from './configs/socketServer.config.js';
import { MongoDB } from './configs/database.config.js';
import morganMiddleware from './middlewares/Morgan.middleware.js';
import errorMiddleware from './middlewares/Error.middleware.js';

const app = express();
const server = http.createServer(app);
setupSocketServer(server);

/**
 * Dependencies configurations
 */

app.use(morgan('dev'));
app.use(morganMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(errorMiddleware);
MongoDB.runServer();

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello, world!' });
});

export default app;
