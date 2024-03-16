import z from 'zod';

export default {
    emailValidation: z
        .string({ required_error: 'Email does not exist' })
        .min(1, 'Email should have at least one character')
        .email('This is not a valid email'),
    passwordValidation: z
        .string({ required_error: 'Password does not exist' }),
    classNameValidation: z
        .string({ required_error: 'Class name does not exist' })
        .min(1, 'Class name should have at least one character'),
    sessionNumberValidation: z
        .string({ required_error: 'Session number does not exist' })
        .min(1, 'Session number should have at least one character'),
};
