import jwt from 'jsonwebtoken';

/**
 *  Generate a json web token that is used across multiple requests to maintain the state of user
 */
const generateToken = (email: string): string => {
    const payload = { user: { email } };
    const secretKey = process.env.JWT_SECRET || 'secretCat';
    const expireTime = '30d';
    return jwt.sign(payload, secretKey, { expiresIn: expireTime });
};

export { generateToken };
