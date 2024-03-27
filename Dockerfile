FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl gnupg

# node and npm
RUN curl -sL https://deb.nodesource.com/setup_19.x | bash -
RUN apt-get install -y nodejs

# MONGO
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
       gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
       --dearmor
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
RUN apt-get update
RUN apt-get install -y mongodb-org
CMD ["mongod"]

WORKDIR /usr/app

COPY ./package.json ./
RUN npm install

COPY ./ ./

CMD ["npm", "run", "dev"]

