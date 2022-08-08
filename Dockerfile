FROM node:16
WORKDIR '/app'
COPY . .
RUN apt update
RUN apt install -y calibre

RUN npm install
RUN npm run build

CMD ["node", "server.js"]
