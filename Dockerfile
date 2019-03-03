FROM node:10

RUN mkdir /app && \
	mkdir /app/node_modules && \
	chown node -R /app /app/node_modules

USER node
WORKDIR /app

CMD npm start
