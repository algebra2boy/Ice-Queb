import app from '../api/server.js';
import request from 'supertest';

describe('simple route', () => {

    describe("GET /", () => {
        it('get hello world', async () => {
            const response = await request(app).get('/');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({ message: 'Hello, world!' });
        });
    })
});
