#Kindle Books

This repository contains a simple frontend and backend for viewing a list of downloadable books. 
This repo can also convert books to mobi, and email them to a kindle email. 

##Setup:

Prequisites:
- redis
- calibre

1. rename `env.json.example` to `env.json` and change username and password to desired.
2. `npm install`
3. `npm run build && node server.js` 

To run in docker:
1. `docker build -t kindle .`
2. `docker run -d --name kindle -p 5000:5000 kindle`
