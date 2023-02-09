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
    return this.responseReducer(response);
  }
  async getMovies({ page = 1, type, genres, sortBy = "popularity" }) {
   

    // if (!genres || genres.length === 0) {
    //   const response = await this.get(`/movie/${type}?page=${page}`);
    //   return this.responseReducer(response);
    // }

    const popular = type === "popular";
    const upcoming = type === "upcoming";
    const now_playing = type === "now_playing";
    const top_rated = type === "top_rated";


    const queryDefaults = { popular: {}, upcoming: {} };
    const minDate = new Date();
    const maxDate = new Date();
    const addMonths = upcoming ? [1, 0] : now_playing ? [0, 0] : [(6, 0)];
    const addDays = now_playing ? [8, -50] : [0, 0];

    maxDate.setFullYear(
      maxDate.getFullYear(),
      maxDate.getMonth() + addMonths[0],
      maxDate.getDate() + addDays[0]
    );
    minDate.setFullYear(
      minDate.getFullYear(),
      minDate.getMonth() + addMonths[1],
      minDate.getDate() + addDays[1]
    );

    const afterDate =
      now_playing || upcoming ? minDate.toISOString().split("T")[0] : null;
    const release_date = {
      "release_date.lte": maxDate.toISOString().split("T")[0],
      ...(afterDate && { "release_date.gte": afterDate }),
    };

    const sortingKeys = {
      rating: "vote_average.desc",
      popularity: "popularity.desc",
      releaseDate: "release_date.desc",
    };
    const genresstring = genres ? genres.join(",") : null;
    const sort_by = sortingKeys[sortBy];
    const vote_count = { "vote_count.gte": top_rated ? 300 : 0 };
    const defaults = {
      "vote_average.lte": 10,
      "vote_average.gte": 0,
      ott_region: "IN",
      certification_country: "IN",
      page: page,
      ...(genresstring && { with_genres: genresstring }),
    };

    var query = new URLSearchParams({
      ...defaults,
      sort_by,
      ...vote_count,
      ...release_date,
    });

    const response = await this.get(`/discover/movie?` + query.toString());

    // console.log(response)

    return this.responseReducer(response);
  }
  async getTrendingMovies() {
    const response = await this.get(`trending/movie/week`);

    return this.responseReducer(response);
  }

  async getLatestMovie() {
    const response = await this.get(`trending/movie/day`);
    return this.responseReducer(response);
  }

  async getMoviesByGenre({ genres, page = 1 }) {
    const genre = genres.join(",");

    var query = new URLSearchParams();
    query.append("with_genres", genre);
    query.append("sort_by", "popularity.desc");
    query.append("certification_country ", "IN");
    query.set("vote_average.lte", 10);
    query.set("ott_region", "IN");
    query.set("page", page);

    const response = await this.get(`/discover/movie?` + query.toString());
    return this.responseReducer(response);
  }

  async getMovieById(id) {
    const response = await this.get(`/movie/${id}`);

    return this.movieReducer(response);
  }
  async getRecommendedMoviesById({ id, page = 1 }) {
    const response = await this.get(
      `/movie/${id}/recommendations?language=en-US&page=${page}`
    );

    return this.responseReducer(response);
  }

  async getSimilarMoviesById({ id, page = 1 }) {
    const response = await this.get(
      `/movie/${id}/similar?language=en-US&page=${page}`
    );

 
    return this.responseReducer(response);
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

  responseReducer(response) {
    const currentpage = response.page;
    const nextPage =
      currentpage < response.total_pages ? currentpage + 1 : null;

    return typeof response === "object" && response.results
      ? {
          page: currentpage,
          nextPage,
          results: response.results.map((movie) => this.movieReducer(movie)),
        }
      : { page: currentpage, nextPage: null, results: [] };
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
