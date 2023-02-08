const typeDefs = require("./schema");
const { paginateResults } = require("./utils");

const defaultResponse = {
  data: [],
  cursor: null,
  hasMore: false,
  hasNextPage: false,
};
const resolvers = {
  MoviesType: {
    POPULAR: "popular",
    UPCOMING: "upcoming",
    NOW_PLAYING: "now_playing",
    TOP_RATED: "top_rated",
  },
  sortByType: {
    POPULARITY: "popularity",
    RELEASE_DATE: "releaseDate",
    RATING: "rating",
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
    search: async (_, { key, after, size = 20, page = 1 }, { dataSources }) => {
      try {
        const response = await dataSources.MovieAPI.searchMovies({
          key,
          page,
        });

        return paginateResults({ after, size, response });
      } catch (e) {
        return null;
      }
    },
    movies: async (
      _,
      { type, after, size = 8, page = 1, genres, sortBy,adult, },
      { dataSources }
    ) => {
      try {
        const response = await dataSources.MovieAPI.getMovies({
          type: type,
          page,
          genres,
          sortBy,
          adult,
        });

        return paginateResults({ after, size, response });
      } catch (e) {
        console.log(e);
      }
    },
    similarMovies: async (
      _,
      { id, after, page, size = 8 },
      { dataSources }
    ) => {
      try {
     
        const response = await dataSources.MovieAPI.getSimilarMoviesById({
          id,
          page,
        });
        const results = paginateResults({ after, size, response });

        return results;
      } catch (e) {
        return defaultResponse;
      }
    },
    recommendedMovies: async (
      _,
      { id, page, after, size = 8 },
      { dataSources }
    ) => {
      try {
        const response = await dataSources.MovieAPI.getRecommendedMoviesById({
          id,
          page,
        });
        const results = paginateResults({ after, size, response });

        return results;
      } catch (e) {}
    },
    movie: async (_, { id }, { dataSources }) => {
      return await dataSources.MovieAPI.getMovieById(id);
    },
    trendingMovies: async (_, { after, size = 8 }, { dataSources }) => {
      try {
        const response = await dataSources.MovieAPI.getTrendingMovies();

        return paginateResults({ after, size, response });
      } catch (e) {}
    },

    latestMovie: async (_, { after, size = 8 }, { dataSources }) => {
      const response = await dataSources.MovieAPI.getLatestMovie();
      const { data } = paginateResults({ after, size, response });
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
    MovieGenre: async (
      _,
      { genres, after, size = 8, page = 1 },
      { dataSources }
    ) => {
      try {
        const response = await dataSources.MovieAPI.getMoviesByGenre({
          genres,
          page,
        });

        return paginateResults({ after, size, response });
      } catch (e) {
        return null;
      }
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
