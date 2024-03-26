import request from 'supertest';
import app from '../../api/app.js';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';

describe('rate limit for auth service routes', () => {
    beforeAll(async () => {
        await MongoDB.runServer();
    });

    afterAll(async () => {
        await MongoDB.closeConnection();
        server.close();
    });

    it('login rate limit', async () => {
        let payload = { email: 'ABC@gmail.com', password: '123456789' };
        for (let i = 0; i < 10; i++) {
            await request(app).post('/api/auth/signup').send(payload);
            payload.email = `${i}` + payload.email.slice(1);
        }

        // the 11th request should be rate limited
        const r = await request(app).post('/api/auth/signup').send(payload);
        expect(r.statusCode).toBe(429);
    });

    it('signup rate limit continue', async () => {
        let payload = { email: 'more@gmail.com', password: '123456789' };
        const r = await request(app).post('/api/auth/signup').send(payload);
        expect(r.statusCode).toBe(429);
    });

    it('login rate limit due to sign up route', async () => {
        let payload = { email: 'ABC@gmail.com', password: '123456789' };
        const r = await request(app).post('/api/auth/login').send(payload);
        expect(r.statusCode).toBe(429);
    });
});
