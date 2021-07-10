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

  type Client {
    id: ID
    name: String
    lastName: String
    company: String
    email: String
    phone: String
    createdAt: String
    seller: ID
  }

  type OrderProduct {
    id: ID
    quantity: Int
  }

  type Order {
    id: ID
    order: [OrderProduct]
    total: Float
    client: ID
    seller: ID
    status: OrderStatus
    createdAt: String
  }
  
  type TopCLient {
    total: Float
    client: Client
  }

  type TopSeller {
    total: Float
    seller: User
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

  input ClientInput {
    name: String
    lastName: String
    company: String
    email: String
    phone: String
  }

  input OrderProductInput {
    id: ID
    quantity: Int
  }

  input OrderInput {
    order: [OrderProductInput]
    total: Float
    client: ID!
    status: OrderStatus
  }

  enum OrderStatus {
    pending
    completed
    cancelled
  }

  type Mutation {
    # Users
    createUser(input: UserInput!): User
    authenticateUser(input: AuthenticateInput!): Token

    # Products
    createProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: ProductInput): Product
    deleteProduct(id: ID!): String

    # Clients
    createClient(input: ClientInput!): Client
    updateClient(id: ID!, input: ClientInput!): Client
    deleteClient(id: ID!): String

    #Orders
    createOrder(input: OrderInput!): Order
    updateOrder(id: ID!, input: OrderInput!): Order
    deleteOrder(id: ID!): String
  }

  type Query {
    # Users
    getUser(token: String!): User

    #Products
    getProducts: [Product]
    getProduct(id: ID!): Product 

    # Clients
    getClients: [Client]
    getClientsBySeller: [Client]
    getClient(id: ID!): Client
    getOrders: [Order]
    getOrdersBySeller: [Order]
    getOrder(id: ID!): Order
    getOrderByStatus(status: OrderStatus!): [Order]

    # Searches
    getBestClients: [TopCLient]
    getBestSellers: [TopSeller]
  }
`

module.exports = typeDefs