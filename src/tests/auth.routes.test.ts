import request from 'supertest';
import app from '../api/app.js';
import server from '../api/server.js';
import { MongoDB } from '../api/configs/database.config.js';
import { ErrorMessages } from '../api/configs/errorsMessage.config.js';

describe('authentication service routes', () => {
    beforeAll(async () => {
        // Setup code before any tests run for mongoDB
        await MongoDB.runServer();
    });

    afterAll(async () => {
        // close MongoDB connection and server after all tests run
        await MongoDB.closeConnection();
        server.close();
    });

    describe('sign up for a user', () => {
        it('correct signup', async () => {
            const payload = { email: 'gg1@example.com', password: 'password123'};
            const response = await request(app).post('/api/auth/signup').send(payload);

            expect(response.statusCode).toBe(201);

            // check body field is not undefined
            expect(response.body.email).toBeDefined();
            expect(response.body.token).toBeDefined();

            expect(response.body.email).toBe(payload.email);
        });

        it('duplicate signup', async () => {
            const payload = { email: 'gg1@example.com', password: 'password123' };
            const response = await request(app).post('/api/auth/signup').send(payload);

            expect(response.statusCode).toBe(403);

            expect(response.body).toStrictEqual({
                message: ErrorMessages.USER_ALREADY_EXISTS(payload.email),
                status: 'failure',
            });
        });

        it('missing email signup', async () => {
            const payload = { password: 'password123' };
            const response = await request(app).post('/api/auth/signup').send(payload);

            const expectedError = {
                message: ['Email does not exist'],
                status: 'failure',
            };

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual(expectedError);
        });

        it('missing password signup', async () => {
            const payload = { email: 'gg1@example.com' };
            const response = await request(app).post('/api/auth/signup').send(payload);

            const expectedError = {
                message: ['Password does not exist'],
                status: 'failure',
            };

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual(expectedError);
        });
        it('missing password', async () => {
            const payload = { email: 'gg1@example.com' };
            const response = await request(app).post('/api/auth/signup').send(payload);

            const expectedError = {
                message: ['Password does not exist'],
                status: 'failure',
            };

            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual(expectedError);
        });
    });

    describe('login for a user', () => {
        it('sign up a user then login successfully', async () => {
            const payload = { email: 'gg1@example.com', password: 'password123' };
            await request(app).post('/api/auth/signup').send(payload);

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'gg1@example.com', password: 'password123' });

            expect(response.statusCode).toBe(200);
            expect(response.body.email).toBeDefined();
            expect(response.body.token).toBeDefined();
        });

        it('sign up a user then login with a wrong password', async () => {
            const payload = { email: 'gg1@example.com', password: 'password123'};
            await request(app).post('/api/auth/signup').send(payload);

            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'gg1@example.com', password: 'badpassword' });

            expect(response.statusCode).toBe(401);
            expect(response.body).toStrictEqual({
                message: ErrorMessages.USER_PASSWORD_NOT_CORRECT(payload.email),
                status: 'failure',
            });
        });

        it('login with a non existing user', async () => {
            const payload = { email: 'apple@example.com', password: 'password123' };
            const response = await request(app).post('/api/auth/login').send(payload);

            expect(response.statusCode).toBe(404);
            expect(response.body).toStrictEqual({
                message: ErrorMessages.USER_NOT_FOUND(payload.email),
                status: 'failure',
            });
        });

        it('missing email and password login', async () => {
            const response = await request(app).post('/api/auth/login');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                message: ['Email does not exist', 'Password does not exist'],
                status: 'failure',
            });
        });

        it('missing email for login', async () => {
            const payload = { password: '12345678' };
            const response = await request(app).post('/api/auth/login').send(payload);
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                message: ['Email does not exist'],
                status: 'failure',
            });
        });

        it('missing password login', async () => {
            const payload = { email: 'apple@gmail.com' };
            const response = await request(app).post('/api/auth/login').send(payload);
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                message: ['Password does not exist'],
                status: 'failure',
            });
        });

        it('bad email login', async () => {
            const payload = { email: 'apple' };
            const response = await request(app).post('/api/auth/login').send(payload);
            expect(response.statusCode).toBe(400);

            expect(response.body).toStrictEqual({
                message: ['This is not a valid email', 'Password does not exist'],
                status: 'failure',
            });
        });
    });
});
