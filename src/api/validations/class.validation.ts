import z from 'zod';
import schemaLibrary from './schemaLibrary.js';

const emailArraySchema = z.array(schemaLibrary.emailValidation);
const classSessionSchema = z.object({
    className: schemaLibrary.classNameValidation,
    sessionNumber: schemaLibrary.sessionNumberValidation,
});

export const classListSchema = z.object({
    query: z.object({
        email: schemaLibrary.emailValidation,
    }),
});

export const classPublishSchema = z.object({
    body: z.object({
        classSession: classSessionSchema,
        emails: emailArraySchema,
    }),
});
