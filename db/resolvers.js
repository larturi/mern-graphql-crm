const Usuario = require('../models/Usuario');

// Resolvers
const resolvers = {
    Query: {
        obtenerCurso: () => "Algo"
    },
    Mutation: {
        nuevoUsuario: async (_, {input}) => {

            const { email, password } = input;

            // Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email});
            
            if (existeUsuario) throw new Error("El usuario ya esta registrado");

            // Hashear el password

            // Grabar en BD
            try {
                const usuario = new Usuario(input);
                usuario.save();
                return usuario;
            } catch (error) {
                console.error(error);
            }
        }
    }
}

module.exports = resolvers;