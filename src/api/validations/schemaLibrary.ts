import z from 'zod';

export default {
    emailValidation: z
        .string({ required_error: 'Email does not exist' })
        .min(1, 'Email should have at least one character')
        .email('This is not a valid email'),
    passwordValidation: z.string({ required_error: 'Password does not exist' }),
    dayValidation: z.number().int().min(0).max(6),
    timeValidation: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
    dateValidation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
};
