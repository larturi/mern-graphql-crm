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
        eliminado: Boolean
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
        eliminado: Boolean
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: Cliente
        vendedor: ID
        fecha: String
        estado: EstadoPedido
    }

    type PedidoGrupo {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type TopVendedor {
        total: Float
        vendedor: [Usuario]
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
        eliminado: Boolean
    }

    input ClienteInput  {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String
        eliminado: Boolean
    }

    input PedidoProductoInput {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
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
        obtenerUsuario: Usuario

        # Productos
        obtenerProductos(eliminado: Boolean!): [Producto]
        obtenerProducto(id: ID!): Producto

        # Clientes
        obtenerClientesVendedor(eliminado: Boolean!): [Cliente]
        obtenerCliente(id: ID!): Cliente

        # Pedidos
        obtenerPedidos: [Pedido]
        obtenerPedidosVendedor: [Pedido]
        obtenerPedido(id: ID!): Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]

        # Busquedas Avanzadas
        mejoresClientes: [TopCliente]
        mejoresVendedores: [TopVendedor]
        buscarProducto(texto: String!): [Producto]
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
        eliminarCliente(id: ID!): String

        # Pedidos
        nuevoPedido(input: PedidoInput): Pedido
        actualizarPedido(id: ID!, input:PedidoInput): Pedido
        eliminarPedido(id: ID!): Pedido
    }
`;

module.exports = typeDefs;