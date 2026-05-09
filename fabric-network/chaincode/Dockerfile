FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json silabos-cc.js ./
RUN npm install --omit=dev
EXPOSE 7052
CMD ["node", "silabos-cc.js"]
