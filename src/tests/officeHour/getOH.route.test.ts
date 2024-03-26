import app from '../../api/app.js';
import request from 'supertest';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';

describe('office hour service get OH routes', () => {
    // helper function to create a user and add an OH
    // return the token, the OH_ID. and the object
    async function createUserAndAddOH(email: string): Promise<[string, string, any]> {
        const signupPayload = { email: email, password: '12345678' };
        const signupResponse = await request(app).post('/api/auth/signup').send(signupPayload);

        const token: string = signupResponse.body.token;

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

        const uploadOHResponse = await request(app).post('/api/officeHour/upload').send(payload);

        const OH_ID: string = uploadOHResponse.body.officeHourToUpload.id;

        return [token, OH_ID, uploadOHResponse.body.officeHourToUpload];
    }

    describe('successful request', () => {
        beforeAll(async () => {
            await MongoDB.runServer();
        });

        afterAll(async () => {
            await MongoDB.closeConnection();
            server.close();
        });

        let token: string, OH_ID: string;
        let OfficeHour: any;

        beforeAll(async () => {
            [token, OH_ID, OfficeHour] = await createUserAndAddOH('yongye0997@gmail.com');
        });

        it('add an office hour ID to student document and get an actual office hour ', async () => {
            await request(app)
                .post(`/api/officeHour/add/${OH_ID}`)
                .set('Authorization', `Bearer ${token}`);

            const response = await request(app).get(
                `/api/officeHour/list/?email=yongye0997@gmail.com`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('email');
            expect(typeof response.body.email).toBe('string');
            expect(response.body.email).toBe('yongye0997@gmail.com');

            expect(response.body).toHaveProperty('officeHours');
            expect(Array.isArray(response.body.officeHours)).toBe(true);
            expect(response.body.officeHours).toHaveLength(1);
            expect(response.body.officeHours[0]).toStrictEqual(OfficeHour);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.email).toBe('string');
            expect(response.body.status).toBe('success');
        });
    });

    describe('unsuccessful request', () => {
        beforeAll(async () => {
            await MongoDB.runServer();
        });

        afterAll(async () => {
            await MongoDB.closeConnection();
            server.close();
        });

        describe('check email validation', () => {
            it('get an office hour without provding an email', async () => {
                const response = await request(app).get(`/api/officeHour/list/`);

                expect(response.statusCode).toBe(400);
                expect(response.body).toStrictEqual({
                    message: ['Email does not exist'],
                    status: 'failure',
                });
            });

            it('get an office hour with an empty query string', async () => {
                const response = await request(app).get(`/api/officeHour/list/?email=`);

                expect(response.statusCode).toBe(400);
                expect(response.body).toStrictEqual({
                    message: [
                        'Email should have at least one character',
                        'This is not a valid email',
                    ],
                    status: 'failure',
                });
            });

            it('get an office hour with an non empty query string but invalid email syntax (1)', async () => {
                const response = await request(app).get(`/api/officeHour/list/?email=abc123`);

                expect(response.statusCode).toBe(400);
                expect(response.body).toStrictEqual({
                    message: ['This is not a valid email'],
                    status: 'failure',
                });
            });

            it('get an office hour with an non empty query string but invalid email syntax (2)', async () => {
                const response = await request(app).get(`/api/officeHour/list/?email=abc123f@gm`);

                expect(response.statusCode).toBe(400);
                expect(response.body).toStrictEqual({
                    message: ['This is not a valid email'],
                    status: 'failure',
                });
            });
        });

        describe('check custom erorr handling', () => {
            it('get an office hour list with an email that does not exist (STUDENT_OFFICE_HOUR_DOCUMENT_NOT_FOUND)', async () => {
                const response = await request(app).get(
                    `/api/officeHour/list/?email=george@gmail.com`,
                );

                expect(response.statusCode).toBe(404);
                expect(response.body).toStrictEqual({
                    message: `No student office hour document is found for george@gmail.com`,
                    status: 'failure',
                });
            });

            it('get an office hour list with an email that does not have any office hour (STUDENT_OFFICE_HOUR_NOT_FOUND)', async () => {
                const studentOfficeHourCollection =
                    MongoDB.getIceQuebDB().collection('StudentOfficeHour');
                studentOfficeHourCollection.insertOne({ email: 'abc@gmail.com' });

                const response = await request(app).get(
                    `/api/officeHour/list/?email=abc@gmail.com`,
                );

                expect(response.statusCode).toBe(404);
                expect(response.body).toStrictEqual({
                    message: `There is student office hour document; however, no office hour is found for abc@gmail.com`,
                    status: 'failure',
                });
            });
        });
    });
});

describe('send a request when a collection does not exist', () => {
    test('studentOfficeHour does not exist', async () => {
        const response = await request(app).get(`/api/officeHour/list/?email=abc@gmail.com`);

        expect(response.statusCode).toBe(500);
    });
});
