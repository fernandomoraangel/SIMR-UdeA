FROM node:22

WORKDIR /usr/src/app

COPY ./simr-back/package*.json ./

RUN npm install

COPY ./simr-back/. .

COPY ./simr-front/src/app/angularjs ./public/angularjs

EXPOSE 3000

CMD [ "npm", "start" ]