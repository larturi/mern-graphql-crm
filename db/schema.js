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
    }
`;

module.exports = typeDefs;