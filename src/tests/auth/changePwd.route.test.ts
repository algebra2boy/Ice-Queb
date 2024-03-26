import app from '../../api/app.js';
import request from 'supertest';

describe('simple route', () => {
    test('GET /', async () => {
        const response = await request(app).get('/').timeout(4000);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Hello, world!' });
    });
});
