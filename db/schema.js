const { gql } = require('apollo-server');

const typeDefs = gql`
    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    type Producto {
        id: ID
        nombre: String
        stock: Int
        precio: Float
        creado: String
    }

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
        creado: String
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: ID
        vendedor: ID
        fecha: String
        estado: EstadoPedido
    }

    type PedidoGrupo {
        id: ID
        cantidad: Int
    }

    type Token {
        token: String
    }

    input UsuarioInput  {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input ProductoInput  {
        nombre: String!
        stock: Int!
        precio: Float!
    }

    input ClienteInput  {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String
    }

    input PedidoProductoInput {
        id: ID
        cantidad: Int
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float!
        cliente: ID!
        estado: EstadoPedido
    }

    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    input AutenticarInput  {
        email: String!
        password: String!
    }

    type Query {
        # Usuarios
        obtenerUsuario(token: String!): Usuario

        # Productos
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto

        # Clientes
        obtenerClientes: [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerCliente(id: ID!): Cliente
    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token

        # Productos
        nuevoProducto(input: ProductoInput): Producto
        actualizarProducto(id: ID!, input: ProductoInput): Producto
        eliminarProducto(id: ID!): Producto

        # Clientes
        nuevoCliente(input: ClienteInput): Cliente
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id: ID!): Cliente

        # Pedidos
        nuevoPedido(input: PedidoInput): Pedido
    }
`;

module.exports = typeDefs;