const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });

const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

const crearToken = (user, secret, expiresIn) => {
    const { id, nombre, apellido, email } = user;
    return jwt.sign( { id, nombre, apellido, email }, secret, { expiresIn } );
}

// Resolvers
const resolvers = {
    Query: {
        // Usuarios
        obtenerUsuario: async (_, {}, ctx) => {
            return ctx.usuario;
        },

        // Productos
        obtenerProductos: async (_, { eliminado }) => {
            try {
                const productos = await Producto.find({eliminado: eliminado});
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
        obtenerClientes: async (_, { eliminado }) => {
            try {
                const clientes = await Cliente.find({eliminado: eliminado});
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
        },

        // Pedidos
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (error) {
                console.error(error);
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({ vendedor: ctx.usuario.id }).populate('cliente');
                return pedidos;
            } catch (error) {
                console.error(error);
            }
        },
        obtenerPedido: async (_, {id}, ctx) => {
            // Validar que el pedido exista
            const pedido = await Pedido.findById(id);
            if (!pedido) throw new Error('No existe el pedido');
            
            // Solo el vendedor que lo creó puede ver el pedido
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            // Returnar el pedido
            return pedido;
        },
        obtenerPedidosEstado: async (_, {estado}, ctx) => {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });
            return pedidos;
        },

        // Busquedas Avanzadas
        mejoresClientes: async () => {

            const clientes = await Pedido.aggregate([
                { $match: { estado: 'COMPLETADO' } },
                { $group: {
                    _id: '$cliente',
                    total: { $sum: '$total' }
                }},
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cliente'
                    }
                },
                {
                    $sort: { total: -1 }
                }
            ]);

            return clientes;
        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                { $match: { estado: 'COMPLETADO' } },
                { $group: {
                    _id: '$vendedor',
                    total: { $sum: '$total' }
                }},
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                },
                {
                    $sort: { total: -1 }
                }
            ]);

            return vendedores;
        },
        buscarProducto: async (_, {texto}) => {
            const productos = await Producto.find({ $text: { $search: texto } });
            return productos;
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

            // producto = await Producto.findByIdAndDelete(id);
            producto = await Producto.findOneAndUpdate({ _id : id }, { eliminado: true });
            return producto;
        },

        // Clientes
        nuevoCliente: async (_, {input}, ctx) => {

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

            // Solo el vendedor que creo el cliente puede borrarlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            // await Cliente.findOneAndDelete({_id: id});
            await Cliente.findOneAndUpdate({_id: id}, {eliminado: true});

            return 'Cliente eliminado';
        },

        // Pedidos
        nuevoPedido: async (_, {input}, ctx) => {

            const { cliente } = input;
           
            // Verificar si el cliente existe
            let clienteExiste = await Cliente.findById(cliente);
            if (!clienteExiste) throw new Error('El cliente no existe');

            // Verificar si el cliente es del vendedor
            if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            // Revisar que haya stock disponible de cada producto
            for await (const  articulo of input.pedido) {
                const { id } = articulo;

                const producto = await Producto.findById(id);

                if (articulo.cantidad > producto.stock) {
                    throw new Error(`El articulo ${producto.nombre} excede el stock disponible`);
                } else {
                    // Restar la cantidad del stock
                    producto.stock = producto.stock - articulo.cantidad;
                    await producto.save();
                }
            }

            // Crear un nuevo pedido
            const nuevoPedido = new Pedido(input);

            // Asignar vendedor al nuevo pedido
            nuevoPedido.vendedor = ctx.usuario.id;

            // Guardar en BD
            try {
                const resultado = await nuevoPedido.save();
                return resultado;
            } catch (error) {
                console.error(error);
            }

        },
        actualizarPedido: async (_, {id, input}, ctx) => {

            const { cliente } = input;

            // Verificar que el pedido existe
            const existePedido = await Pedido.findById(id);
            if (!existePedido) throw new Error('No existe el pedido');

            // Verificar que el cliente existe
            const existeCliente = await Cliente.findById(cliente);
            if (!existeCliente) throw new Error('No existe el cliente');

            // Verificar que el pedido y el cliente pertenezcan al vendedor
            if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            // Revisar que haya stock disponible de cada producto
            if (input.pedido) {
                for await (const  articulo of input.pedido) {
                    const { id } = articulo;
    
                    const producto = await Producto.findById(id);
    
                    if (articulo.cantidad > producto.stock) {
                        throw new Error(`El articulo ${producto.nombre} excede el stock disponible`);
                    } else {
                        // Restar la cantidad del stock
                        producto.stock = producto.stock - articulo.cantidad;
                        await producto.save();
                    }
                }
            }

            // Grabar en BD
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true});
            return resultado;
        },
        eliminarPedido: async (_, {id}, ctx) => {
            // Verificar que exista el pedido
            let pedido = await Pedido.findById(id);
            if(!pedido) throw new Error('El pedido no existe');

            // Solo el vendedor que creo el pedido puede borrarlo
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No autorizado');
            }

            await Pedido.findOneAndDelete({_id: id});

            return pedido;
        },
    }
}

module.exports = resolvers;