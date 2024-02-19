import { z } from 'zod';
import schemaLibrary from './schemaLibrary.js';

export const loginSchema = z.object({
    body: z.object({
        email: schemaLibrary.emailValidation,
        password: schemaLibrary.passwordValidation,
    }),
});

export const signupSchema = z.object({
    body: z.object({
        email: schemaLibrary.emailValidation,
        password: schemaLibrary.passwordValidation,
        isTeacher: z.boolean({ required_error: 'isTeacher does not exist' }),
    }),
});
