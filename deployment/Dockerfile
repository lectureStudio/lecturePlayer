# Build lectureplayer

FROM node:16 as build-step

RUN mkdir -p /app

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app
RUN npm install @angular/cli -g
RUN ng build --prod


# Run nginx server to host built app

FROM nginx:1.17.1-alpine
COPY --from=build-step /app/dist/angular-player /usr/share/nginx/html

