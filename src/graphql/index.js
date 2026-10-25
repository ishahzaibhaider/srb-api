const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

// Starts Apollo Server and returns the Express middleware for POST /graphql
async function createGraphQLMiddleware() {
  const apollo = new ApolloServer({ typeDefs, resolvers, includeStacktraceInErrorResponses: false });
  await apollo.start();
  return expressMiddleware(apollo);
}

module.exports = { createGraphQLMiddleware };
