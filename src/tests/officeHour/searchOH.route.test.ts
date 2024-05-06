import app from '../../api/app.js';
import request from 'supertest';
import server from '../../api/server.js';
import { MongoDB } from '../../api/configs/database.config.js';
import { OfficeHour } from '../../api/services/officeHour/officeHour.model.js';

describe('office hour service search OH routes', () => {
    beforeAll(async () => {
        await MongoDB.runServer();
    });

    afterAll(async () => {
        await MongoDB.closeConnection();
        server.close();
    });

    const uploadingOHPayloads = [
        {
            facultyEmail: 'yongye@umass.edu',
            facultyName: 'Yongye',
            startDate: '2022-01-01',
            endDate: '2022-01-01',
            day: 2,
            startTime: '12:00',
            endTime: '13:00',
            courseDepartment: 'Plant Pathology',
            courseNumber: '220',
        },
        {
            facultyEmail: 'george1@umass.edu',
            facultyName: 'George',
            startDate: '2022-02-02',
            endDate: '2022-02-03',
            day: 3,
            startTime: '12:00',
            endTime: '13:00',
            courseDepartment: 'Mathematics',
            courseNumber: '545',
        },
        {
            facultyEmail: 'george2@umass.edu',
            facultyName: 'CS George',
            startDate: '2022-02-02',
            endDate: '2022-02-03',
            day: 0,
            startTime: '12:00',
            endTime: '13:00',
            courseDepartment: 'Computer Science',
            courseNumber: '520',
        },
        {
            facultyEmail: 'george2@umass.edu',
            facultyName: 'CS George',
            startDate: '2022-02-02',
            endDate: '2022-02-03',
            day: 2,
            startTime: '12:00',
            endTime: '13:00',
            courseDepartment: 'Computer Science',
            courseNumber: '520',
        },
    ];

    async function uploadOH(): Promise<OfficeHour[]> {
        const responses = [];
        for (const payload of uploadingOHPayloads) {
            const response = await request(app).post('/api/officeHour/upload').send(payload);
            responses.push(response);
        }

        const uploadedOH = [];
        for (const response of responses) {
            uploadedOH.push(response.body.officeHourToUpload);
        }

        return uploadedOH;
    }

    describe('successful request', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let uploadedOH: any;
        beforeAll(async () => {
            uploadedOH = await uploadOH();
        });

        it('searches the correct office hour when student inserts both faculty name and course name', async () => {
            const facultyName = 'Yongye';
            const courseName = 'PLPATH220';

            const response = await request(app).get(
                `/api/officeHour/search?facultyName=${facultyName}&courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches the correct office hour when student inserts only faculty name', async () => {
            const facultyName = 'Yongye';

            const response = await request(app).get(
                `/api/officeHour/search?facultyName=${facultyName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches the correct office hour when student inserts faculty name and course name containing only course department', async () => {
            const facultyName = 'Yongye';
            const courseName = '220';

            const response = await request(app).get(
                `/api/officeHour/search?facultyName=${facultyName}&courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches the correct office hour when student inserts faculty name and course name containing only course number', async () => {
            const facultyName = 'Yongye';
            const courseName = '220';

            const response = await request(app).get(
                `/api/officeHour/search?facultyName=${facultyName}&courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches the correct office hour when student inserts only course name', async () => {
            const courseName = 'PLPATH220';

            const response = await request(app).get(
                `/api/officeHour/search?courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches the correct office hour when student inserts course name containing only course department', async () => {
            const courseName = 'PLPATH';

            const response = await request(app).get(
                `/api/officeHour/search?courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches the correct office hour when student inserts course name containing only course number', async () => {
            const courseName = '220';

            const response = await request(app).get(
                `/api/officeHour/search?courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(1);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[0]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('returns empty array when user insert empty query', async () => {
            const response = await request(app).get(`/api/officeHour/search?`);

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(4);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches all of the correct office hour that match the query', async () => {
            const courseName = '520';

            const response = await request(app).get(
                `/api/officeHour/search?courseName=${courseName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(2);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[2]);
            expect(response.body.searchResult[1]).toStrictEqual(uploadedOH[3]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });

        it('searches all of the correct office hour that contain the query', async () => {
            const facultyName = 'George';

            const response = await request(app).get(
                `/api/officeHour/search?facultyName=${facultyName}`,
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty('searchResult');

            expect(Array.isArray(response.body.searchResult)).toBe(true);
            expect(response.body.searchResult).toHaveLength(3);
            expect(response.body.searchResult[0]).toStrictEqual(uploadedOH[1]);
            expect(response.body.searchResult[1]).toStrictEqual(uploadedOH[2]);
            expect(response.body.searchResult[2]).toStrictEqual(uploadedOH[3]);

            expect(response.body).toHaveProperty('status');
            expect(typeof response.body.status).toBe('string');
            expect(response.body.status).toBe('success');
        });
    });
});
