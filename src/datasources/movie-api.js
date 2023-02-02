const { RESTDataSource } = require("apollo-datasource-rest");

class MovieAPI extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = "https://api.themoviedb.org/3/";
  }
  willSendRequest(request) {
    request.params.set("api_key", this.context.apiKey);
  }

  async searchMovies({ page = 1, key }) {
    const response = await this.get(`/search/movie?query=${key}&page=${page}`);

    
    const currentpage = response.page;
    const nextPage =
      currentpage < response.total_pages ? currentpage + 1 : null;

    return typeof response === "object" && response.results
      ? {
          nextPage,
          results: response.results.map((movie) => this.movieReducer(movie)),
        }
      : { nextPage: null, results: [] };
  }
  async getMovies({ page = 1, type }) {
    const response = await this.get(`/movie/${type}?page=${page}`);

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }
  async getTrendingMovies() {
    const response = await this.get(`trending/movie/week`);

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }

  async getLatestMovie() {
    const response = await this.get(`trending/movie/day`);

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }

  async getMoviesByGenre({ genres, page = 1 }) {
    const genre = genres.join(",");

    var query = new URLSearchParams();
    query.append("with_genres", genre);
    query.append("sort_by", "popularity.desc");
    query.set("page", page);
    console.log(query.toString());
    const response = await this.get(`/discover/movie?` + query.toString());

    const currentpage = response.page;
    const nextPage =
      currentpage < response.total_pages ? currentpage + 1 : null;

    return typeof response === "object" && response.results
      ? {
          nextPage,
          results: response.results.map((movie) => this.movieReducer(movie)),
        }
      : { nextPage: null, results: [] };
  }

  async getMovieById(id) {
    const response = await this.get(`/movie/${id}`);

    return this.movieReducer(response);
  }
  async getRecommendedMoviesById({ id }) {
    const response = await this.get(
      `/movie/${id}/recommendations?language=en-US`
    );

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }

  async getSimilarMoviesById({ id }) {
    const response = await this.get(`/movie/${id}/similar`);

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }

  async getVideosByMovieId({ id }) {
    const response = await this.get(`/movie/${id}/videos`);

    const types = {};
    response.results.forEach((vid, i) => {
      if (typeof types[`${vid.type}`] === "undefined") {
        types[`${vid.type}`] = [];
      }
      const video = this.videoReducer(vid);
      types[vid.type]?.push(video);
    });

    return types;
  }
  async getImagesByMovieId(id) {
    const response = await this.get(
      `/movie/${id}/images?language=en-US&include_image_language=en,null`
    );
    let poster = [];
    let backDrop = [];
    response.backdrops.forEach((image) => {
      if (image.iso_639_1 === "en") {
        poster.push(image.file_path);
        return;
      }
      backDrop.push(image.file_path);
    });
    const p = Math.floor(Math.random() * poster.length);
    const b = Math.floor(Math.random() * backDrop.length);
    return poster.length !== 0 ? poster[p] : backDrop[b];
  }
  videoReducer({ id, key, name, size, official, type }) {
    return {
      id,
      key,
      name,
      size,
      official,
      type,
    };
  }
  movieReducer(movie) {
    return {
      id: movie.id,
      title: movie.title,
      backdropPath: movie.backdrop_path,
      posterPath: movie.poster_path,
      overview: movie.overview,
      popularity: movie.popularity,
      adult: movie.adult,
      releaseDate: movie.release_date,
      tagline: movie.tagline,
      runtime: movie.runtime,
      genres: movie?.genres,
    };
  }
  ImageReducer(image) {
    return {
      aspectRatio: image.aspect_ratio,
      filePath: image.file_path,
      height: image.height,
      width: image.width,
      en: image.iso_639_1,
    };
  }
}

module.exports = MovieAPI;
