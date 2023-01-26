const typeDefs = require("./schema");
const { paginateResults } = require("./utils");

const resolvers = {
  MoviesType: {
    POPULAR: "popular",
    UPCOMING: "upcoming",
    PLAYING: "now_playing",
  },
  VideoType: {
    CLIP: "Clip",
    TRAILER: "Trailer",
    TEASER: "Teaser",
    BTS: "Behind the Scenes",
    BLOOPERS: "Bloopers",
    FEATURETTE: "Featurette",
  },
  Query: {
    movies: async (_, { type, after, size = 8, page = 1 }, { dataSources }) => {
      try {
        const data = await dataSources.MovieAPI.getMovies({ type: type, page });

        const Movies = paginateResults({ after, size, results: data });

        return Movies;
      } catch (e) {}
    },
    similarMovies: async (_, { id, after, size = 8 }, { dataSources }) => {
      try {
        const data = await dataSources.MovieAPI.getSimilarMoviesById({ id });

        const Movies = paginateResults({ after, size, results: data });

        return Movies;
      } catch (e) {}
    },
    recommendedMovies: async (_, { id, after, size = 8 }, { dataSources }) => {
      try {
        const data = await dataSources.MovieAPI.getRecommendedMoviesById({
          id,
        });

        const Movies = paginateResults({ after, size, results: data });

        return Movies;
      } catch (e) {}
    },
    movie: async (_, { id }, { dataSources }) => {
      return await dataSources.MovieAPI.getMovieById(id);
    },
    trendingMovies: async (_, { after, size = 8 }, { dataSources }) => {
      try {
        const results = await dataSources.MovieAPI.getTrendingMovies();

        const Movies = paginateResults({ after, size, results });

        return Movies;
      } catch (e) {}
    },

    latestMovie: async (_, { after, size = 8 }, { dataSources }) => {
      const results = await dataSources.MovieAPI.getLatestMovie();
      const { data } = paginateResults({ after, size, results });
      return data;
    },
    seriesList: async (_, args, { dataSources }) => {
      return await dataSources.SeriesAPI.getTopRatedSeries();
    },
    series: async (_, { id }, { dataSources }) => {
      return await dataSources.SeriesAPI.getSeriesById(id);
    },
    trendingSeries: async (_, args, { dataSources }) => {
      return await dataSources.SeriesAPI.getTrendingSeries();
    },
    MovieGenre: async (_, { genres, after, size = 8 }, { dataSources }) => {
      try {
        const data = await dataSources.MovieAPI.getMoviesByGenre({
          genres,
        });

        const Movies = paginateResults({ after, size, results: data });

        return Movies;
      } catch (e) {}
    },
    videosById: async (
      _,
      { id, types, size = 12 },

      { dataSources }
    ) => {
      try {
        const data = await dataSources.MovieAPI.getVideosByMovieId({
          id,
        });

        const response = {
          clip: [],
          trailer: [],
          teaser: [],
          bts: [],
          bloopers: [],
          featurette: [],
        };

        if (Object.keys(data).length === 0) {
          return null;
        }

        types.forEach((type) => {
          var current = data[type];
          if (!current || current.length === 0) {
            return;
          }
          const videos = current.splice(0, Math.min(current.length, size));
          response[type.toLowerCase()] = videos;
        });

        return response;
      } catch (e) {}
    },
  },
  Movie: {
    videos: async ({ id }, { types, size = 1, after }, { dataSources }) => {
      try {
        const data = await dataSources.MovieAPI.getVideosByMovieId({
          id,
        });

        const response = {
          clip: [],
          trailer: [],
          teaser: [],
          bts: [],
          bloopers: [],
          featurette: [],
        };

        if (Object.keys(data).length === 0) {
          return null;
        }

        types.forEach((type) => {
          var current = data[type];
          if (!current || current.length === 0) {
            return;
          }
          const filter = current.filter((video) => video.official === true);
          const videos = filter.splice(0, Math.min(current.length, size));
          response[type.toLowerCase()] = videos;
        });

        return response;
      } catch (e) {}
    },
    landscapePosterPath: async ({ id }, args, { dataSources }) => {
      return await dataSources.MovieAPI.getImagesByMovieId(id);
    },
  },
  Series: {
    videos: async ({ id }, args, { dataSources }) => {
      return await dataSources.SeriesAPI.getVideosBySeriesId(id);
    },
  },
};

module.exports = resolvers;
