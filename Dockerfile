FROM node:16-alpine

WORKDIR '/app'

COPY /dist/index.js /app

CMD ["node", "index.js"]
