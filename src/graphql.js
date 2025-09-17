const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const SECRET = 'supersecret';
const users = [{ username: 'user', password: 'pass', balance: 100 }];

const typeDefs = gql`
  type Query {
    balance: Int
  }
  type Mutation {
    login(username: String!, password: String!): String
    transfer(amount: Int!): Int
  }
`;

const resolvers = {
  Query: {
    balance: (parent, args, context) => {
      if (!context.user) throw new Error('Not authenticated');
      const user = users.find(u => u.username === context.user.username);
      return user ? user.balance : null;
    },
  },
  Mutation: {
    login: (parent, { username, password }) => {
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) throw new Error('Invalid credentials');
      return jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    },
    transfer: (parent, { amount }, context) => {
      if (!context.user) throw new Error('Not authenticated');
      const user = users.find(u => u.username === context.user.username);
      if (!user || user.balance < amount) throw new Error('Insufficient funds');
      user.balance -= amount;
      return user.balance;
    },
  },
};

async function startServer() {
  const app = express();
  app.use(bodyParser.json());
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const auth = req.headers.authorization || '';
      if (auth.startsWith('Bearer ')) {
        try {
          const user = jwt.verify(auth.replace('Bearer ', ''), SECRET);
          return { user };
        } catch (e) {
          return {};
        }
      }
      return {};
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
  return app;
}

module.exports = startServer;
