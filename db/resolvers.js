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
        // Usuarios
        obtenerUsuario: async (_, { token }) => {
            const usuarioId = await jwt.verify(token, process.env.JWT_SECRET);
            return usuarioId;
        },

        // Productos
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

        // Clientes
        obtenerClientes: async () => {
            try {
                const clientes = await Cliente.find({});
                return clientes;
            } catch (error) {
                console.error(error);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
                return clientes;
            } catch (error) {
                console.error(error);
            }
        },
        obtenerCliente: async (_, {id}, ctx) => {
            try {
                // Revisar que el cliente exista
                const cliente = await Cliente.findById(id);
                if (!cliente) throw new Error('Cliente no encontrado');

                // Solo el vendedor que lo creo puede ver el detalle del cliente
                if (cliente.vendedor.toString() !== ctx.usuario.id) {
                    throw new Error('No autorizado');
                }

                return cliente;

            } catch (error) {
                console.error(error);
            }
        }
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
        nuevoCliente: async (_, {input}, ctx) => {

            console.log(ctx);

            const { email } = input;
           
            // Verificar si el cliente existe
            const cliente = await Cliente.findOne({ email });
            if (cliente) throw new Error('El cliente ya se encuentra registrado');

            const nuevoCliente = new Cliente(input);

            // Asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;

            // Guardar en BD
            try {
                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.error(error);
            }

        },
        actualizarCliente: async (_, {id, input}, ctx) => {
            // Verificar que exista el cliente
            let cliente = await Cliente.findById(id);
            if(!cliente) throw new Error('El cliente no existe');

            // Solo el vendedor que creo el cliente puede editarlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            // Grabar en BD
            cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
            return cliente;
        },
        eliminarCliente: async (_, {id}, ctx) => {
            // Verificar que exista el cliente
            let cliente = await Cliente.findById(id);
            if(!cliente) throw new Error('El cliente no existe');

            // Solo el vendedor que creo el cliente puede editarlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            await Cliente.findOneAndDelete({_id: id});

            return cliente;
        }
    }
}

module.exports = resolvers;