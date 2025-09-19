const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const users = require('../userModel');
const checkoutController = require('./controllers/checkoutController');

const JWT_SECRET = 'your-super-secret-and-long-key';

const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Token {
    token: String!
  }

  type CheckoutItem {
    productId: Int
    quantity: Int
  }

  type CheckoutResponse {
    freight: Float
    items: [CheckoutItem]
    paymentMethod: String
    userId: ID
    valorFinal: Float
  }

  input CheckoutItemInput {
    productId: Int!
    quantity: Int!
  }

  input CardDataInput {
    number: String!
    name: String!
    expiry: String!
    cvv: String!
  }

  type Query {
    users: [User]
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): User
    login(email: String!, password: String!): Token
    checkout(items: [CheckoutItemInput!]!, freight: Float!, paymentMethod: String!, cardData: CardDataInput): CheckoutResponse
  }
`;

const resolvers = {
  Query: {
    users: () => users,
  },
  Mutation: {
    register: async (parent, { name, email, password }) => {
      const existingUser = users.find(user => user.email === email);
      if (existingUser) throw new Error('Email already in use.');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: users.length + 1, name, email, password: hashedPassword };
      users.push(newUser);
      return { id: newUser.id, name: newUser.name, email: newUser.email };
    },
    login: async (parent, { email, password }) => {
      const user = users.find(user => user.email === email);
      if (!user) throw new Error('Invalid credentials.');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Invalid credentials.');

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      return { token };
    },
    checkout: checkoutController.processGraphQL,
  },
};

const startServer = async () => {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const user = jwt.verify(token, JWT_SECRET);
          return { user }; // Adiciona o usuário ao contexto
        } catch (err) {
          // Token inválido, não adiciona usuário ao contexto
          return {};
        }
      }
      return {};
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  return app;
};

module.exports = startServer;