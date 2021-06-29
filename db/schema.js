const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID
    name: String
    lastName: String
    email: String
    password: String
    createdAt: String
  }

  type Token {
    token: String
  }

  type Product {
    id: ID
    name: String
    stock: Int
    price: Float
    createdAt: String
  }

  input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
  }

  input AuthenticateInput {
    email: String!
    password: String!
  }

  input ProductInput {
    name: String
    stock: Int
    price: Float
  }

  type Mutation {
    # Users
    createUser(input: UserInput!): User
    authenticateUser(input: AuthenticateInput!): Token

    # Products
    createProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String
  }

  type Query {
    # Users
    getUser(token: String!): User

    #Products
    getProducts: [Product]
    getProduct(id: ID!): Product 
  }
`

module.exports = typeDefs