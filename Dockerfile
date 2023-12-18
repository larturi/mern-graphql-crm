FROM node:14

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4005
ENV DB_MONGO=mongodb://entriesdb:27017/crm-graphql
ENV JWT_SECRET=asdf1234zxcv

EXPOSE 4005

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
