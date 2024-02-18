import z from 'zod';

export default {
    emailValidation: z
        .string()
        .min(1, 'email should have at least one character')
        .email('This is not a valid email'),
    passwordValidation: z.string().min(8, 'password should have at least eight characters'),
};
