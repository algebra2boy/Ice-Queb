import request from 'supertest';
import app from '../api/server.js';

describe('authentication serivice routes', () => {

    describe('/POST', () => {
        it('/signup', async () => {
            const payload = { email: 'test@example.com', password: 'password123', isTeacher: true };
            const response = await request(app)
                .post('/api/auth/signup')
                .send(payload);

            console.log(response);

            expect(response.statusCode).toBe(201);
            expect(response.body)
        })
    })
})
