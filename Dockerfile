FROM node:alpine
RUN mkdir -p /code
COPY . /code
WORKDIR /code
RUN npm install

EXPOSE 8086
CMD ["npm", "start"]
