import morgan from 'morgan';
import logger from '../configs/winstonLogger.config.js';

const format = ':method :url :status :response-time ms HTTP/:http-version [:date]';

// Credit to: https://stackoverflow.com/a/28824464/22303588
/**
 * This custom morgan middleware will log any incoming HTTP requests to the `logs` folder in
 * the `combined.log` and `error.log` file.
 *
 * The `combined.log` includes both informational and error logs.
 * The `error.log` includes only the error log.
 */
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
