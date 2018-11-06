FROM node:10
WORKDIR /etc/wx/

COPY package*.json .babelrc ./

RUN npm install

COPY src/ src/

RUN npm run build && npm run build

COPY config.json ./

CMD ["npm", "start"]
