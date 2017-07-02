import * as express from 'express';

export const app = express();
export const server = app.listen(3001, console.log);

console.log('Express server listening on port 3001');
