require("dotenv").config();
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const MovieAPI = require("./datasources/movie-api");
const SeriesAPI=require("./datasources/series-api")


async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => {
      return {
        MovieAPI: new MovieAPI(),
        SeriesAPI:new SeriesAPI(),
      };
    },
    context: ({ req }) => ({
      apiKey: process.env.MOVIE_API_KEY,
    }),
  });

  const { url, port } = await server.listen({ port: process.env.PORT || 4000});
   
}

startApolloServer(typeDefs, resolvers);
