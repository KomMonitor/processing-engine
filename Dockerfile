FROM node:alpine
RUN mkdir -p /code/tmp
COPY . /code
WORKDIR /code
RUN npm install --production

# generate up-to-date KmHelper API docs
RUN jsdoc -c jsdoc.json

#increase heap size to 4 GB
ENV NODE_OPTIONS=--max_old_space_size=4096

EXPOSE 8086
CMD ["npm", "start"]
