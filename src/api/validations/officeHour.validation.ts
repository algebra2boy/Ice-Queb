import z from 'zod';
import schemaLibrary from './schemaLibrary.js';

export const officeHourListSchema = z.object({
    query: z.object({
        email: schemaLibrary.emailValidation,
    }),
});

export const officeHourIDSchema = z.object({
    params: z.object({
        officeHourID: schemaLibrary.officeHourIDValidation,
    }),
});

export const officeHourUploadSchema = z.object({
    body: z.object({
        facultyName: schemaLibrary.facultyNameValidation,
        facultyEmail: schemaLibrary.emailValidation,
        startDate: schemaLibrary.dateValidation,
        endDate: schemaLibrary.dateValidation,
        day: schemaLibrary.dayValidation,
        startTime: schemaLibrary.timeValidation,
        endTime: schemaLibrary.timeValidation,
        courseDepartment: schemaLibrary.courseDepartmentValidation,
        courseNumber: schemaLibrary.courseNumberValidation,
    }),
});

export const officeHourDeleteSchema = z.object({
    body: z.object({
        facultyEmail: schemaLibrary.emailValidation,
        startDate: schemaLibrary.dateValidation,
        endDate: schemaLibrary.dateValidation,
        courseDepartment: schemaLibrary.courseDepartmentValidation,
        courseNumber: schemaLibrary.courseNumberValidation,
    }), 
});
