import z from 'zod';
import schemaLibrary from './schemaLibrary.js';

export const classListSchema = z.object({
    query: z.object({
        email: schemaLibrary.emailValidation,
    }),
});
