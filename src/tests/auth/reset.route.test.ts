import request from 'supertest';
import app from '../../api/app.js';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';
import { ErrorMessages } from '../../api/configs/errorsMessage.config.js';

describe('authentication service routes for reset password', () => {
    beforeAll(async () => {
        // Setup code before any tests run for MongoDB
        await MongoDB.runServer();
    });

    afterAll(async () => {
        // Close MongoDB connection and server after all tests run
        await MongoDB.closeConnection();
        server.close();
    });

    describe('reset password for a user', () => {
        it('successfully reset password', async () => {
            const signupPayload = { email: 'reset@umass.edu', password: 'oldPassword123', isTeacher: false };
            await request(app).post('/api/auth/signup').send(signupPayload);

            const resetPayload = {
                email: 'reset@umass.edu',
                oldPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                isTeacher: false
            };
            const response = await request(app).post('/api/auth/reset').send(resetPayload);

            console.log(response.body);
            console.log(response.status)

            expect(response.statusCode).toBe(200);
            expect(response.body.email).toBe('reset@umass.edu');
            expect(response.body.token).toBeDefined();
        });

        it('reset with incorrect old password', async () => {
            const signupPayload = { email: 'reset2@umass.edu', password: 'oldPassword123', isTeacher: false };
            await request(app).post('/api/auth/signup').send(signupPayload);

            const resetPayload = {
                email: 'reset2@umass.edu',
                oldPassword: 'incorrectOldPassword',
                newPassword: 'newPassword123',
                isTeacher: false
            };
            const response = await request(app).post('/api/auth/reset').send(resetPayload);

            expect(response.statusCode).toBe(401);
            expect(response.body).toStrictEqual({
                message: ErrorMessages.USER_PASSWORD_NOT_CORRECT('reset2@umass.edu'),
                status: 'failure',
            });
        });

        it('reset password for non-existing user', async () => {
            const resetPayload = {
                email: 'marius@marius.hell',
                oldPassword: 'oldPassword123',
                newPassword: 'newPassword123',
                isTeacher: false
            };
            const response = await request(app).post('/api/auth/reset').send(resetPayload);

            expect(response.statusCode).toBe(404);
            expect(response.body).toStrictEqual({
                message: ErrorMessages.USER_NOT_FOUND('marius@marius.hell'),
                status: 'failure',
            });
        });

        it('missing new password in request', async () => {
            const signupPayload = { email: 'reset3@umass.edu', password: 'oldPassword123', isTeacher: false };
            await request(app).post('/api/auth/signup').send(signupPayload);

            const resetPayload = {
                email: 'reset3@umass.edu',
                oldPassword: 'oldPassword123',
            };
            const response = await request(app).post('/api/auth/reset').send(resetPayload);

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                message: ['New password does not exist', 'Missing isTeacher'],
                status: 'failure',
            });
        });

        it('reset password with invalid email', async () => {
            const resetPayload = {
                email: 'invalidemail',
                oldPassword: 'oldPassword123',
                newPassword: 'newPassword123',
            };
            const response = await request(app).post('/api/auth/reset').send(resetPayload);

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                message: ['This is not a valid email', "Missing isTeacher"],
                status: 'failure',
            });
        });
    });
});
