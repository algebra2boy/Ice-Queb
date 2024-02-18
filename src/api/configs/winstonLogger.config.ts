import winston from 'winston';

const winstonLogger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: './logs/combined.log',
            maxsize: 10000000, // max size of file to, log file will be rotated when reaching 10MB
        }),
        new winston.transports.File({
            level: 'error',
            filename: './logs/error.log',
            maxsize: 10000000,
        }),
    ],

    format: winston.format.combine(winston.format.simple()),
});

export default winstonLogger;
