const Usuario = require('../models/Usuario');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });

const crearToken = (user, secret, expiresIn) => {
    console.log(user);
    const { id, nombre, apellido, email } = user;
    return jwt.sign( { id }, secret, { expiresIn } );
}

// Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, { token }) => {
            const usuarioId = await jwt.verify(token, process.env.JWT_SECRET);
            return usuarioId;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input}) => {

            const { email, password } = input;

            // Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email});
            
            if (existeUsuario) throw new Error("El usuario ya esta registrado");

            // Hashear el password
            const salt = bcryptjs.genSaltSync(10);
            input.password = bcryptjs.hashSync(password, salt)

            // Grabar en BD
            try {
                const usuario = new Usuario(input);
                usuario.save();
                return usuario;
            } catch (error) {
                console.error(error);
            }
        },

        autenticarUsuario: async (_, {input}) => {

            const { email, password } = input;

            // Validar que el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) throw new Error('El usuario no existe');

            // Validar password correcto
            const passwordCorrecto = bcryptjs.compareSync(password, existeUsuario.password);
            if (!passwordCorrecto) throw new Error('El password es incorrecto');

            // Crear token
            return {
                token: crearToken(existeUsuario, process.env.JWT_SECRET, '24h')
            }

        },
    }
}

module.exports = resolvers;