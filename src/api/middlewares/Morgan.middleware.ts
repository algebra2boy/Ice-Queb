import morgan from 'morgan';
import logger from '../configs/winstonLogger.js';

const format = ':method :url :status :response-time ms HTTP/:http-version [:date]';

// Credit to: https://stackoverflow.com/a/28824464/22303588
const morganMiddleware = morgan(format, {
    stream: {
        write: message => {
            const trimmedMessage = message.trim();
            const statusCode = parseInt(trimmedMessage.split(' ')[2]);
            if (statusCode <= 399) {
                logger.info(trimmedMessage);
            } else if (statusCode >= 400 && statusCode <= 599) {
                logger.error(trimmedMessage);
            }
        },
    },
});

export default morganMiddleware;
