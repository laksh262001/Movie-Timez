FROM node

WORKDIR /usr/nodeapp
COPY ./package.json ./
RUN npm install

COPY ./ ./

CMD ["node","app.js"]