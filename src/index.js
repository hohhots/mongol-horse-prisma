const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');

const Query = require('./resolvers/Query');
const Mutation = require('./resolvers/Mutation');
const User = require('./resolvers/User');
const Book = require('./resolvers/Book');
const Page = require('./resolvers/Page');

const resolvers = {
  Query,
  Mutation,
  User,
  Book,
  Page,
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: (request) => {
    return {
      ...request,
      prisma,
    };
  },
});

server.start(() => console.log('Server is running on http://localhost:4000'));
