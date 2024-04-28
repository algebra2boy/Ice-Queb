import z from 'zod';
import { department } from '../utils/departmentTranslation.util.js';

export default {
    // Auth service validation
    emailValidation: z
        .string({ required_error: 'Email does not exist' })
        .min(1, 'Email should have at least one character')
        .email('This is not a valid email'),
    passwordValidation: z
        .string({ required_error: 'Password does not exist' })
        .min(8, 'Password should have at least 8 characters'),
    newPasswordValidation: z
        .string({ required_error: 'New password does not exist' })
        .min(8, 'New password should have at least 8 characters'),

    // Office Hour service validation
    dayValidation: z
        .number({ required_error: 'Day does not exist' })
        .int({ message: 'Day should be an integer' })
        .min(0, { message: 'Day should be between 0 and 6' })
        .max(6, { message: 'Day should be between 0 and 6' }),
    timeValidation: z
        .string({ required_error: 'Time does not exist' })
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time format' }),
    dateValidation: z
        .string({
            required_error: 'Date does not exist',
        })
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format' }),
    facultyNameValidation: z.string({ required_error: 'facultyName does not exist' }),
    courseDepartmentValidation: z
        .string({ required_error: 'courseDepartment does not exist' })
        .refine(courseDepartment => department.includes(courseDepartment), {
            message: 'Invalid course department',
        }),
    courseNumberValidation: z.string({ required_error: 'courseNumber does not exist' }),

    // uuid version 4 produces 36 random characters
    officeHourIDValidation: z
        .string({ required_error: 'officeHourID does not exist' })
        .length(36, 'officeHourID should be 36 characters long'),
};
