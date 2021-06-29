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

  type Mutation {
    createUser(input: UserInput!): User
    authenticateUser(input: AuthenticateInput!): Token
  }

  type Query {
    getUser(token: String!): User
  }
`

module.exports = typeDefs