FROM node:14

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4005
ENV JWT_SECRET=asdf1234zxcv

ARG DB_MONGO
ENV DB_MONGO=${DB_MONGO}

EXPOSE 4005

# Comando para ejecutar la aplicación
CMD ["node", "index.js"]
