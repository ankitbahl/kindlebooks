import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import {queryLibgen, downloadFile, sendToKindle, downloadConvertFile} from "./src/utils/queryLibgen.js";
import fs from "fs";
import { createClient } from 'redis';
import {authenticate, login} from "./src/utils/authHelper.js";
import {lookup} from "dns";

let options = {};

let isDocker = await new Promise(resolve =>
  lookup('host.docker.internal', (err, res) => {
    if (err) {
      resolve(false);
    } else if (res) {
      resolve(true);
    } else {
      resolve(false);
    }
  })
);

if (isDocker) {
  options = {socket: {host: 'host.docker.internal', port: 6378 }};
}
const redisClient = createClient(options);
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

const app = express();
const port = 5000;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.redirect('/login-page');
});

app.get('/book-list', async (req, res) => {

  if (!await authenticate(req, res, redisClient)) {

    return;
  }
  const searchTerm = req.query.searchTerm;
  res.json(await queryLibgen(searchTerm));
});

app.get('/download-book', async (req, res) => {
  if (!await authenticate(req, res, redisClient)) {
    return;
  }

  const bookUrl = req.query.bookUrl;
  const filename = await downloadFile(bookUrl);
  res.download(`./temp/${filename}`, () => {
    fs.unlinkSync(`./temp/${filename}`);
  });
});

app.get('/download-convert-book', async (req, res) => {
  if (!await authenticate(req, res, redisClient)) {
    return;
  }

  const bookUrl = req.query.bookUrl;
  const filename = await downloadConvertFile(bookUrl);

  res.download(`./temp/${filename}`, () => {
    fs.unlinkSync(`./temp/${filename}`);
  });
});

app.get('/send-to-kindle', async (req, res) => {
  if (!await authenticate(req, res, redisClient)) {
    return;
  }

  const bookUrl = req.query.bookUrl;
  const selectedKindle = req.query.selectedKindle;
  let email = '';
  switch (selectedKindle) {
    case 'ankit':
      email = 'aNkit2-bahl@kindle.com';
      break;
    case 'ankita':
      email = 'baruahan07_1LINrb@kindle.com';
      break;
  }
  const filename = await downloadFile(bookUrl);
  try {
    await sendToKindle(filename, email);
  } catch (e) {
    console.error(e);
    res.send(400);
  }
  res.sendStatus(200);
});

app.post('/login', async (req, res) => {
  const user = req.body.username;
  const pass = req.body.password;
  try {
    const {token, expiry} = await login(user, pass, redisClient);
    res.json({token, expiry});
  } catch (e) {
    console.error(e);
    res.sendStatus(403);
  }
});

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'build')
app.use(express.static(root));

app.use(express.static('temp'));

app.get('*', (req, res) => {
  res.sendFile('index.html', { root });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
