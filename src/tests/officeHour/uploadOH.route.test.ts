import request from 'supertest';
import app from '../../api/app.js';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';

describe('office hour service office hour routes', () => {
    beforeAll(async () => {
        await MongoDB.runServer();
    });

    afterAll(async () => {
        await MongoDB.closeConnection();
        server.close();
    });

    describe('upload a office hour', () => {
        const testCases = [
            {
                description: 'missing facultyName',
                fieldToRemove: 'facultyName',
                expectedError: ['facultyName does not exist'],
            },
            {
                description: 'missing startDate',
                fieldToRemove: 'startDate',
                expectedError: ['Date does not exist'],
            },
            {
                description: 'missing endDate',
                fieldToRemove: 'endDate',
                expectedError: ['Date does not exist'],
            },
            {
                description: 'missing day',
                fieldToRemove: 'day',
                expectedError: ['Day does not exist'],
            },
            {
                description: 'day is not an integer',
                modify: { day: '2' },
                expectedError: ['Expected number, received string'],
            },
            {
                description: 'day is not between 0 and 6',
                modify: { day: 7 },
                expectedError: ['Day should be between 0 and 6'],
            },
            {
                description: 'day is a decimal number',
                modify: { day: 3.5 },
                expectedError: ['Day should be an integer'],
            },
            {
                description: 'missing startTime',
                fieldToRemove: 'startTime',
                expectedError: ['Time does not exist'],
            },
            {
                description: 'invalid startTime format',
                modify: { startTime: '12:60' },
                expectedError: ['Invalid time format'],
            },
            {
                description: 'missing endTime',
                fieldToRemove: 'endTime',
                expectedError: ['Time does not exist'],
            },
            {
                description: 'invalid endTime format',
                modify: { endTime: '25:00' },
                expectedError: ['Invalid time format'],
            },
            {
                description: 'missing courseDepartment',
                fieldToRemove: 'courseDepartment',
                expectedError: ['courseDepartment does not exist'],
            },
            {
                description: 'invalid courseDepartment',
                modify: { courseDepartment: 'Math' },
                expectedError: ['Invalid course department'],
            },
            {
                description: 'missing courseNumber',
                fieldToRemove: 'courseNumber',
                expectedError: ['courseNumber does not exist'],
            },
        ];

        interface Payload {
            [key: string]: string | number;
        }

        testCases.forEach(({ description, fieldToRemove, modify, expectedError }) => {
            it(description, async () => {
                let payload: Payload = {
                    facultyName: 'John Doe',
                    startDate: '2022-01-01',
                    endDate: '2022-01-01',
                    day: 2,
                    startTime: '12:00',
                    endTime: '13:00',
                    courseDepartment: 'Computer Science',
                    courseNumber: '220',
                };

                if (fieldToRemove) delete payload[fieldToRemove];
                if (modify) Object.assign(payload, modify);

                const response = await request(app).post('/api/officeHour/upload').send(payload);

                expect(response.statusCode).toBe(400);
                expect(response.body).toStrictEqual({ message: expectedError, status: 'failure' });
            });
        });

        it('upload a office hour successfully', async () => {
            const payload = {
                facultyName: 'John Doe',
                startDate: '2022-01-01',
                endDate: '2022-01-01',
                day: 2,
                startTime: '12:00',
                endTime: '13:00',
                courseDepartment: 'Nutrition',
                courseNumber: '220',
            };

            const response = await request(app).post('/api/officeHour/upload').send(payload);

            expect(response.statusCode).toBe(200);

            const officeHourToUpload = response.body.officeHourToUpload;

            expect(officeHourToUpload.id).toBeDefined();
            expect(officeHourToUpload.facultyName).toBe(payload.facultyName);
            expect(officeHourToUpload.startDate).toBe(payload.startDate);
            expect(officeHourToUpload.endDate).toBe(payload.endDate);
            expect(officeHourToUpload.day).toBe(payload.day);
            expect(officeHourToUpload.startTime).toBe(payload.startTime);
            expect(officeHourToUpload.endTime).toBe(payload.endTime);
            expect(officeHourToUpload.courseDepartment).toBe('NUTR');
            expect(officeHourToUpload.courseNumber).toBe(payload.courseNumber);
            expect(response.body.status).toBe('success');
        });

        it('upload a office hour successfully (2)', async () => {
            const payload = {
                facultyName: 'Yongye',
                startDate: '2022-01-01',
                endDate: '2022-01-01',
                day: 2,
                startTime: '12:00',
                endTime: '13:00',
                courseDepartment: 'Plant Pathology',
                courseNumber: '220',
            };

            const response = await request(app).post('/api/officeHour/upload').send(payload);

            expect(response.statusCode).toBe(200);

            const officeHourToUpload = response.body.officeHourToUpload;

            expect(officeHourToUpload.id).toBeDefined();
            expect(officeHourToUpload.facultyName).toBe(payload.facultyName);
            expect(officeHourToUpload.startDate).toBe(payload.startDate);
            expect(officeHourToUpload.endDate).toBe(payload.endDate);
            expect(officeHourToUpload.day).toBe(payload.day);
            expect(officeHourToUpload.startTime).toBe(payload.startTime);
            expect(officeHourToUpload.endTime).toBe(payload.endTime);
            expect(officeHourToUpload.courseDepartment).toBe('PLPATH');
            expect(officeHourToUpload.courseNumber).toBe(payload.courseNumber);
            expect(response.body.status).toBe('success');
        });
    });
});
