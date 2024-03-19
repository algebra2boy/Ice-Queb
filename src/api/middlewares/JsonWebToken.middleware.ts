import { expressjwt } from 'express-jwt';

/**
 * This object contains a middlware for validating JWT through the `jsonwebtoken` module.
 * An encryption algortihm, HS256, is used.
 */
const jwtMiddleware = expressjwt({
    secret: process.env.JWT_SECRET || 'OFFICEHOUSE', // secret key to encode jwt
    algorithms: ['HS256'], // specify the algorithm
});

export default jwtMiddleware;
