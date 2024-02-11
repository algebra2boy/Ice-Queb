import express, { Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import 'dotenv/config';

const app = express();

/**
 * Dependencies configurations
 */

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

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
