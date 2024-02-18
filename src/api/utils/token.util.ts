import jwt from 'jsonwebtoken';

const generateToken = (email: string): string => {
    const payload = { user: { email } };
    const secretKey = process.env.JWT_SECRET || 'secretCat';
    const expireTime = '10h';
    return jwt.sign(payload, secretKey, { expiresIn: expireTime });
};

export { generateToken };
