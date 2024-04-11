import { z } from 'zod';
import schemaLibrary from './schemaLibrary.js';

export const authSchema = z.object({
    body: z.object({
        email: schemaLibrary.emailValidation,
        password: schemaLibrary.passwordValidation
    })
});

export const resetAuthSchema = z.object({
    body: z.object({
        email: schemaLibrary.emailValidation,
        oldPassword: schemaLibrary.passwordValidation,
        newPassword: schemaLibrary.newPasswordValidation
    })
});