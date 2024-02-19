import z from 'zod';

export default {
    emailValidation: z
        .string({ required_error: 'Email does not exist' })
        .min(1, 'Email should have at least one character')
        .email('This is not a valid email'),
    passwordValidation: z
        .string({ required_error: 'Password does not exist' })
        .min(8, 'Password should have at least eight characters'),
};
