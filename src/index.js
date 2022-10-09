const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const MovieAPI = require("./datasources/movie-api");
const SeriesAPI = require("./datasources/series-api");


async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    // cors: {
    //   origin: [
    //     "https://monyflix.vercel.app",
    //     "http://localhost:3000/",
    //     "https://studio.apollographql.com",
    //   ],
    // },
    dataSources: () => {
      return {
        MovieAPI: new MovieAPI(),
        SeriesAPI: new SeriesAPI(),
      };
    },
    context: ({ req }) => ({
      apiKey: 'fa3d6387121a694b9ea90c9a7655ac87',
    }),
  });

  const { url, port } = await server.listen({ port: process.env.PORT || 4000 });
}

startApolloServer(typeDefs, resolvers);
