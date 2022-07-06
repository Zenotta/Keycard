FROM node:17-alpine3.14

WORKDIR '/app'

COPY /dist/index.js /app

CMD ["node", "index.js"]
