import * as fs from 'fs';

export const loadJSON = (path: string | URL) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf-8'));