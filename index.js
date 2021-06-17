const { ApolloServer } = require('apollo-server');

require('dotenv').config({ path: '.env' });
const jwt = require('jsonwebtoken');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');

// Conectar a la BD
conectarDB();

// Servidor
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        const token = req.headers['authorization'] || '';
        if (token) {
            try {
                const usuario = jwt.verify(token, process.env.JWT_SECRET);
                return {
                    usuario
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
});

// Arrancar el Servidor
server.listen().then( ({url}) => {
 console.log(`Servidor corriendo en la URL ${url}`);
});
