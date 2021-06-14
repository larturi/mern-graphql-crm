const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

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
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({});
                return productos;
            } catch (error) {
                console.error(error);
            }
        },
        obtenerProducto: async (_, { id }) => {
            try {
                const producto = await Producto.findById(id);
                if (!producto) throw new Error('Producto no encontrado');
                return producto;
            } catch (error) {
                console.error(error);
            }
        },
    },
    Mutation: {
        // Usuarios
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

        // Productos
        nuevoProducto: async (_, {input}) => {
            // Grabar en BD
            try {
                const producto = new Producto(input);
                const resultado = await producto.save();
                return resultado;
            } catch (error) {
                console.error(error);
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            let producto = await Producto.findById(id);
            if (!producto) throw new Error('Producto no encontrado');

            producto = await Producto.findOneAndUpdate({ _id : id }, input, { new: true });
            return producto;
        },
        eliminarProducto: async (_, {id}) => {
            let producto = await Producto.findById(id);
            if (!producto) throw new Error('Producto no encontrado');

            producto = await Producto.findByIdAndDelete(id);
            return producto;
        },

        // Clientes
        nuevoCliente: async (_, {input}) => {

            const { email } = input;
           
            // Verificar si el cliente existe
            const cliente = await Cliente.findOne({ email });
            if (cliente) throw new Error('El cliente ya se encuentra registrado');

            const nuevoCliente = new Cliente(input);

            // Asignar el vendedor
            nuevoCliente.vendedor = '60c632d081ba96676e9cfc22';

            // Guardar en BD
            try {
                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.error(error);
            }

        }
    }
}

module.exports = resolvers;