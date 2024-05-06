import app from '../../api/app.js';
import request from 'supertest';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';

describe('office hour service delete OH route', () => {
    beforeAll(async () => {
        await MongoDB.runServer();
    });

    afterAll(async () => {
        await MongoDB.closeConnection();
        server.close();
    });

    describe('unauthenticated user request', () => {
        it('should return 401 without a bearer token', async () => {
            const response = await request(app).delete('/api/officeHour/remove/123');
            const expectedError = {
                message: 'No authorization token was found',
                status: 'failure',
            };

            expect(response.statusCode).toBe(401);
            expect(response.body).toStrictEqual(expectedError);
        });

        it('should return 401 without an invalid bearer token', async () => {
            const response = await request(app)
                .delete('/api/officeHour/remove/123')
                .set('Authorization', 'Bearer 2');

            const expectedError = {
                message: 'jwt malformed',
                status: 'failure',
            };

            expect(response.statusCode).toBe(401);
            expect(response.body).toStrictEqual(expectedError);
        });
    });

    describe('authenticated user request', () => {
        let token = '';
        let email = 'yongye0997@gmail.com';
        let OH1_ID = '';
        let OH2_ID = '';

        beforeAll(async () => {
            const signupPayload = { email: email, password: '12345678', isTeacher: false };
            const signupResponse = await request(app).post('/api/auth/signup').send(signupPayload);

            expect(signupResponse.statusCode).toBe(201);
            expect(signupResponse.body).toHaveProperty('token');
            token = signupResponse.body.token;

            const payload1 = {
                facultyEmail: "Yongye1209@gmail.com",
                facultyName: 'Yongye',
                startDate: '2022-01-01',
                endDate: '2022-01-01',
                day: 2,
                startTime: '12:00',
                endTime: '13:00',
                courseDepartment: 'Plant Pathology',
                courseNumber: '220',
            };

            const payload2 = {
                facultyEmail: "george@gmail.com",
                facultyName: 'George',
                startDate: '2022-02-02',
                endDate: '2022-02-03',
                day: 3,
                startTime: '12:00',
                endTime: '13:00',
                courseDepartment: 'Mathematics',
                courseNumber: '545',
            };

            const uploadOHResponse_1 = await request(app)
                .post('/api/officeHour/upload')
                .send(payload1);

            OH1_ID = uploadOHResponse_1.body.officeHourToUpload.id;

            const uploadOHResponse_2 = await request(app)
                .post('/api/officeHour/upload')
                .send(payload2);

            OH2_ID = uploadOHResponse_2.body.officeHourToUpload.id;

            const studentOH = MongoDB.getIceQuebDB().collection('StudentOfficeHour');
            await studentOH.updateOne(
                { email: email },
                {
                    $set: {
                        officeHourId: [OH1_ID, OH2_ID],
                    },
                },
            );
        });

        it('should return 400 if the office hour id is not 36 characters long', async () => {
            const response = await request(app)
                .delete('/api/officeHour/remove/123')
                .set('Authorization', `Bearer ${token}`);

            const expectedError = {
                message: ['officeHourID should be 36 characters long'],
                status: 'failure',
            };

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual(expectedError);
        });

        it('should return 400 if the office hour id is not 36 characters long', async () => {
            const response = await request(app)
                .delete('/api/officeHour/remove/123')
                .set('Authorization', `Bearer ${token}`);

            const expectedError = {
                message: ['officeHourID should be 36 characters long'],
                status: 'failure',
            };

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual(expectedError);
        });

        it('should return 400 if the office hour id found in the office hour collection', async () => {
            const response = await request(app)
                .delete('/api/officeHour/remove/123412341234123412341234123412348765')
                .set('Authorization', `Bearer ${token}`);

            const expectedError = {
                message:
                    'Office Hour ID 123412341234123412341234123412348765 does not exist in the office hour collection',
                status: 'failure',
            };

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual(expectedError);
        });

        it('successfully delete a student office hour', async () => {
            const response = await request(app)
                .delete(`/api/officeHour/remove/${OH1_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toStrictEqual({ status: 'success' });

            const studentOH = MongoDB.getIceQuebDB().collection('StudentOfficeHour');
            const studentOHDocument = await studentOH.findOne({ email: email });

            expect(studentOHDocument).not.toBeNull();
            expect(studentOHDocument!.officeHourId).not.toBeNull();
            expect(studentOHDocument!.officeHourId.length).toBe(1);
            expect(studentOHDocument!.officeHourId).toStrictEqual([OH2_ID]);
        });

        it('successfully delete the second student office hour', async () => {
            const response = await request(app)
                .delete(`/api/officeHour/remove/${OH2_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toStrictEqual({ status: 'success' });

            const studentOH = MongoDB.getIceQuebDB().collection('StudentOfficeHour');
            const studentOHDocument = await studentOH.findOne({ email: email });

            expect(studentOHDocument).not.toBeNull();
            expect(studentOHDocument!.officeHourId).not.toBeNull();
            expect(studentOHDocument!.officeHourId.length).toBe(0);
            expect(studentOHDocument!.officeHourId).toStrictEqual([]);
        });
    });
});
