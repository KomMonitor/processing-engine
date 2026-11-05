FROM node:26.13.0-alpine3.24
RUN mkdir -p /code/tmp
COPY . /code
WORKDIR /code
# jsdoc is a production dependency (pinned via package-lock.json), as the
# 'prestart' script regenerates the KmHelper API docs on every container start
RUN npm install --production

# generate up-to-date KmHelper API docs using the locally installed jsdoc
RUN npx --no-install jsdoc -c jsdoc.json

#increase heap size to 4 GB
ENV NODE_OPTIONS=--max_old_space_size=4096

EXPOSE 8086
CMD ["npm", "start"]
