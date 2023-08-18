import { createDirectus, authentication, rest, refresh } from '@directus/sdk';
import express, { Express, Request, Response } from 'express';
import { exec } from 'node:child_process';

require('dotenv').config();

const parseCookie: any = (str:string) => {
    if (str == "")
	return {};
    
  return str
  .split(';')
  .map(v => v.split('='))
      .reduce((acc: any, v: any) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
    return acc;
  }, {});
};

const app: Express = express();
const port: string | undefined = process.env.PORT || "3001";
const host: string | undefined = process.env.HOST || "http://localhost:8055"
const cwd: string | undefined = process.env.CWD || "/app"

//Directus client
const client = createDirectus(host).with(authentication()).with(rest());

app.post('/build', async (req: Request, res: Response) => {

    // Handling errors separately below
    try {
	const cookie = req.headers?.cookie ? parseCookie(req.headers.cookie) : "";
	const token = cookie?.directus_refresh_token ? cookie.directus_refresh_token : ""

	if(!cookie) throw Error('Cookie not found from headers.')
	if(!token) throw Error('Parsed no directus_refresh_token from cookie.')
	
	// Throws exception if something wrong with credentials below
	await client.request(refresh(token, 'cookie'));

	exec('npm run build', {
	    cwd: cwd
	}, (err, stdout, stderr) => {
	    console.log('ERROR: ', err);
	    console.log('STDOUT: ', stdout);
	    console.log('STDERR: ', stderr);
	});
	
	// As execution continues to here, lets send OK response
	res.sendStatus(200);
	
    } catch(error) {
	console.log(error)
	res.sendStatus(403);
    }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
