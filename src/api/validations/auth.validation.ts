import { z } from 'zod';
import schemaLibrary from './schemaLibrary.js';

export const authSchema = z.object({
    body: z.object({
        email: schemaLibrary.emailValidation,
        password: schemaLibrary.passwordValidation,
    }),
});
