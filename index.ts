import { createDirectus, authentication, rest, login } from '@directus/sdk';
import express, { Express, Request, Response } from 'express';
import { exec } from 'node:child_process';

require('dotenv').config();

const app: Express = express();
const port: string | undefined = process.env.PORT || "3001";
const host: string | undefined = process.env.HOST || "http://localhost:8055"
const cwd: string | undefined = process.env.CWD || "/app"

//Directus client
const client = createDirectus(host).with(authentication()).with(rest());

app.post('/build', async (req: Request, res: Response) => {
    const user = typeof req.headers?.user === 'string' ? req.headers.user : "";
    const password = typeof req.headers?.password === 'string' ? req.headers.password : "";

    // login using the authentication composable
    try {
	// Throw exception if something wrong with credentials
	await client.login(user, password, {});
	exec('npm run build', {
	    cwd: cwd
	}, (err, stdout, stderr) => {
	    console.log('ERROR: ', err, '\nSTDOUT: ', stdout, '\nSTDERR: ', stderr);
	});
	
	// As execution continues to here, lets send OK response
	res.sendStatus(200);
	
    } catch(error) {
	console.log((error as Error).message);
	res.sendStatus(403);
    }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
