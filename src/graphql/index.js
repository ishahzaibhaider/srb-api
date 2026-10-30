const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

// Starts Apollo Server and returns the Express middleware for POST /graphql
async function createGraphQLMiddleware() {
  const apollo = new ApolloServer({ typeDefs, resolvers, includeStacktraceInErrorResponses: false });
  await apollo.start();
  // the request's Authorization header is passed to the resolvers, which check login + role
  return expressMiddleware(apollo, { context: async ({ req }) => ({ authHeader: req.get('Authorization') }) });
}

module.exports = { createGraphQLMiddleware };
