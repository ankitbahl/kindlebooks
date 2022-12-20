import fs from 'fs';
import crypto from "crypto";

const tokenTTL = 60 * 60 * 24 * 7;
// returns auth token
export async function login(username, password, redisClient) {
  const env = JSON.parse(fs.readFileSync('./env.json'));
  if (username === env.username && password === env.password) {
    const token = crypto.randomUUID().replace(/-/g,'');
    await new Promise((res, rej) => {
      redisClient.set(token, username).then(() => {
        redisClient.expire(token, tokenTTL).then(() => {
          res();
        }).catch(e => {
          console.error(e);
          rej();
        });
      }).catch(e => {
        console.error(e);
        rej();
      });
    });

    const expireTime = await new Promise(res => {
      redisClient.pExpireTime(token).then(exp => res(exp));
    });

    return {token, expiry: expireTime};
  } else {
    throw 'Invalid username or password';
  }
}

export async function authenticate(req, res, redisClient) {
  const token = req.header('auth');
  const containsToken = await new Promise(resolve => {
    redisClient.exists(token).then(val => {
      if (val) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });

  if (!containsToken) {
    res.sendStatus(403);
    return false;
  }
  return true;
}