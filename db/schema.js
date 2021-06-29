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
    name: String!
    stock: Int!
    price: Float!
  }

  type Mutation {
    # Users
    createUser(input: UserInput!): User
    authenticateUser(input: AuthenticateInput!): Token

    # Products
    createProduct(input: ProductInput!): Product
  }

  type Query {
    getUser(token: String!): User
  }
`

module.exports = typeDefs