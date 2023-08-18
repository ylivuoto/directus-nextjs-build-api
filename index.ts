import { createDirectus, authentication, rest, createItem } from '@directus/sdk';
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

    // Handling errors separately below
    try {
	const auth_token = req.headers?.authorization ? req.headers.authorization : "";
	const access_token = auth_token.split(' ')[1]; // Token only
	client.setToken(access_token)

	if(!access_token) throw Error('Authorization bearer not found from headers.')
	
	// Throws exception if something wrong with credentials below
	await client.request(createItem('build_log', {info: `Deploy request from ${req.headers.host}.`}));

	exec('npm run build', {
	    cwd: cwd
	}, (err, stdout, stderr) => {
	    console.log('ERROR: ', err);
	    console.log('STDOUT: ', stdout);
	    console.log('STDERR: ', stderr);
	    
	    // As execution continues to here, lets send OK response
	    res.sendStatus(200);
	});
	
	client.setToken("");
    } catch(error) {
	console.log(error)
	res.sendStatus(403);
    }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
