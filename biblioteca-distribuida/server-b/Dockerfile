FROM node:18-alpine

WORKDIR /app

COPY server-b/package.json ./

RUN npm install

COPY server-b/ ./
COPY proto/ /proto/

EXPOSE 50052

CMD ["node", "server.js"]