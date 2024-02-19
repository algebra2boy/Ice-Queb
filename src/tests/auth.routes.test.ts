import request from 'supertest';
import app from '../api/app.js';
import { MongoDB } from '../api/configs/database.config.js';

describe('authentication serivice routes', () => {

    beforeAll(async () => {
        // Setup code before any tests run for mongoDB
        await MongoDB.runServer();
    });

    afterAll(async () => {
        // close MongoDB connection after all tests run
        await MongoDB.closeConnection();
    });
    describe('/POST', () => {
        it('/signup', async () => {
            const payload = { email: 'gg1@example.com', password: 'password123', isTeacher: true };
            const response = await request(app)
                .post('/api/auth/signup')
                .send(payload);

            console.log(response);

            expect(response.statusCode).toBe(201);
        })
    })
})
