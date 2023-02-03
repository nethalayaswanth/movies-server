const { gql } = require("apollo-server");

const typeDefs = gql`
  union Media = Movie | Series

  type VideosByType {
    clip: [Video]
    trailer: [Video]
    teaser: [Video]
    bts: [Video]
    bloopers: [Video]
    featurette: [Video]
  }

  union VideoList = Videos | VideosByType
  enum MoviesType {
    POPULAR
    UPCOMING
    PLAYING
    TRENDING
    TOP_RATED
    NOW_PLAYING
  }
  enum VideoType {
    CLIP
    TRAILER
    TEASER
    BTS
    BLOOPERS
    FEATURETTE
  }

  type Query {
    movies(type: MoviesType!, after: Int, size: Int, page: Int): Movies
    search(key: String!, after: Int, size: Int, page: Int): Movies
    movie(id: ID!): Movie
    seriesList: [Series]
    series(id: ID!): Series
    trendingSeries: [Series]
    trendingMovies(after: Int, size: Int, page: Int): Movies
    trending: [Media]
    MovieGenre(
      genres: [String]!
      after: Int
      size: Int
      page: Int
      page: Int
    ): Movies
    latestMovie: [Movie]
    similarMovies(id: ID!, after: Int, size: Int, page: Int): Movies
    recommendedMovies(id: ID!, after: Int, size: Int, page: Int): Movies
    videosById(
      id: ID!
      types: [VideoType]
      after: Int
      size: Int
      page: Int
    ): VideosByType
  }

  type Movie {
    landscapePosterPath: String
    posterPath: String
    id: Int
    title: String
    backdropPath: String
    overview: String
    popularity: String
    adult: String
    releaseDate: String
    tagline: String
    runtime: Int
    genres: [Genre]
    videos(types: [VideoType], after: Int, size: Int, page: Int): VideosByType
  }

  type Genre {
    id: Int
    name: String
  }
  type Video {
    id: String
    key: String
    name: String
    size: Int
    official: Boolean
    type: String
  }
  type Image {
    aspectRatio: Float
    filePath: String
    height: Int
    width: Int
    en: String
  }
  type Series {
    posterPath: String
    id: Int
    title: String
    backdropPath: String
    videos: [Video]
  }

  type Videos {
    data: [Video]
    cursor: Int
    hasMore: Boolean
  }
  type Movies {
    data: [Movie]
    cursor: Int
    hasMore: Boolean
    nextPage: Int
  }
`;

module.exports = typeDefs;
