import { Router, Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'path';

const router = Router();

const ASSET_FOLDER = path.resolve(process.cwd(), 'src/assets');
const classJSON = await fs.readFile(path.resolve(ASSET_FOLDER, 'class.json'), 'utf8');
const classes = JSON.parse(classJSON);

router.get('/class', (req: Request, res: Response) => {
    res.json(classes);
});

export default Router().use('/api', router);
