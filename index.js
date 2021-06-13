const { ApolloServer } = require('apollo-server');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const conectarDB = require('./config/db');

// Conectar a la BD
conectarDB();

// Servidor
const server = new ApolloServer({
    typeDefs,
    resolvers
});

// Arrancar el Servidor
server.listen().then( ({url}) => {
 console.log(`Servidor corriendo en la URL ${url}`);
});