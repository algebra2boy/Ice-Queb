import z from 'zod';
import schemaLibrary from './schemaLibrary.js';

export const officeHourListSchema = z.object({
    query: z.object({
        email: schemaLibrary.emailValidation,
    }),
});

export const officeHourUploadSchema = z.object({
    body: z.object({
        id: z.string({ required_error: 'id does not exist' }),
        facultyName: z.string({ required_error: 'faculty does not exist' }),
        startDate: schemaLibrary.dateValidation,
        endDate: schemaLibrary.dateValidation,
        day: schemaLibrary.dayValidation,
        startTime: schemaLibrary.timeValidation,
        endTime: schemaLibrary.timeValidation,
        courseDepartment: z.string({ required_error: 'courseDepartment does not exist' }),
        courseNumber: z.string({ required_error: 'courseNumber does not exist' }),
    }),
});
