FROM node:22 as builder

WORKDIR /app

COPY package*.json ./
COPY angular.json ./

RUN npm install

COPY . .

RUN npm run build -- --configuration production --output-path=dist

FROM nginx:alpine

COPY --from=builder /app/dist/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
