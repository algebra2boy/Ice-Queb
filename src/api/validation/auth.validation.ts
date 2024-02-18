import { z } from 'zod';

const schemaLibrary = {
    emailValidation: z
        .string()
        .min(1, 'email should have at least one character')
        .email('This is not a valid email'),
    passwordValidation: z.string().min(8, 'password should have at least eight characters'),
};

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
        isTeacher: z.boolean(),
    }),
});
