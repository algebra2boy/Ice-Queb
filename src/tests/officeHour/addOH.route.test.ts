import request from 'supertest';
import app from '../../api/app.js';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';

describe('office hour service add OH routes', () => {
    beforeAll(async () => {
        await MongoDB.runServer();
    });

    afterAll(async () => {
        await MongoDB.closeConnection();
        server.close();
    });

    describe('unauthenticated user request', () => {
        it('should return 401 without a bearer token', async () => {
            const response = await request(app).post('/api/officeHour/add/123');
            const expectedError = {
                message: 'No authorization token was found',
                status: 'failure',
            };

            expect(response.statusCode).toBe(401);
            expect(response.body).toStrictEqual(expectedError);
        });

        it('should return 401 without an invalid bearer token', async () => {
            const response = await request(app)
                .post('/api/officeHour/add/123')
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
            const signupPayload = { email: email, password: '12345678' };
            const signupResponse = await request(app).post('/api/auth/signup').send(signupPayload);

            expect(signupResponse.statusCode).toBe(201);
            expect(signupResponse.body).toHaveProperty('token');
            token = signupResponse.body.token;

            const payload1 = {
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
        });

        it("Add an office hour to a student's list (student document does not exist)", async () => {
            const addOHResponse = await request(app)
                .post(`/api/officeHour/add/${OH1_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(addOHResponse.statusCode).toBe(201);
            expect(addOHResponse.body).toStrictEqual({
                message: `A new student office hour document has been created for ${email} with the officeHourID ${OH1_ID}.`,
                status: 'success',
            });

            const studentOH = MongoDB.getIceQuebDB().collection('StudentOfficeHour');
            const studentOHDocument = await studentOH.findOne({ email: email });
            expect(studentOHDocument!.officeHourId).toContain(OH1_ID);
        });

        it("Add the second office hour to a student's list (student document exists)", async () => {
            const addOHResponse = await request(app)
                .post(`/api/officeHour/add/${OH2_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(addOHResponse.statusCode).toBe(201);
            expect(addOHResponse.body).toStrictEqual({
                message: `The officeHourID ${OH2_ID} has been added to ${email}'s student office hour document successfully.`,
                status: 'success',
            });

            const studentOH = MongoDB.getIceQuebDB().collection('StudentOfficeHour');
            const studentOHDocument = await studentOH.findOne({ email: email });
            expect(studentOHDocument!.officeHourId).toStrictEqual([OH1_ID, OH2_ID]);
        });

        it('Add a duplicated office hour to a student list', async () => {
            const addOHResponse = await request(app)
                .post(`/api/officeHour/add/${OH2_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(addOHResponse.statusCode).toBe(400);
            expect(addOHResponse.body).toStrictEqual({
                message: `The officeHourID ${OH2_ID} is duplicated in the ${email} student office hour document.`,
                status: 'failure',
            });

            const studentOH = MongoDB.getIceQuebDB().collection('StudentOfficeHour');
            const studentOHDocument = await studentOH.findOne({ email: email });
            expect(studentOHDocument!.officeHourId).toStrictEqual([OH1_ID, OH2_ID]);
        });

        it('Add a non-existing office hour id to a student list', async () => {
            const fakeID = '123412341234123412341234123412348765';
            const addOHResponse = await request(app)
                .post(`/api/officeHour/add/${fakeID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(addOHResponse.statusCode).toBe(400);
            expect(addOHResponse.body).toStrictEqual({
                message: `Office Hour ID ${fakeID} does not exist in the office hour collection`,
                status: 'failure',
            });
        });

        it('Add an office hour to a student list with office hour id that is not 36 charaters', async () => {
            const fakeID = '1234';
            const addOHResponse = await request(app)
                .post(`/api/officeHour/add/${fakeID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(addOHResponse.statusCode).toBe(400);
            expect(addOHResponse.body).toStrictEqual({
                message: ['officeHourID should be 36 characters long'],
                status: 'failure',
            });
        });
    });
});
