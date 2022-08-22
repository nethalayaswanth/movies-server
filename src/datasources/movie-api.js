const { RESTDataSource } = require("apollo-datasource-rest");

class MovieAPI extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = "https://api.themoviedb.org/3/";
  }
  willSendRequest(request) {
    
    
    request.params.set("api_key", this.context.apiKey);
    
    console.log(request);
  }

  async getMovies({ page = 1, type }) {
    const response = await this.get(`/movie/${type}?page=${page}`);

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }
  async getTrendingMovies() {
    const response = await this.get(`trending/movie/day`);

    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }

  async getLatestMovie() {
    const response = await this.get(`trending/movie/day`);
   
    const len = response?.results.length;
    const i = Math.floor(Math.random() * (len - 1));
    const movie = response?.results[i];
    return movie && this.movieReducer(movie);
  }

  async getMoviesByGenre({ genres }) {
    const genre = genres.join(",");

    console.log(genre)
    
    var query = new URLSearchParams();
    query.append("with_genres", genre);
    const response = await this.get(
      `/discover/movie?` + query.toString()
    );

    console.log(response);
    return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];
  }


  async getMovieById(id) {
    const response = await this.get(`/movie/${id}`);

    console.log(response)
    return this.movieReducer(response);
  }

  async getSimilarMoviesById({id}) {
    const response = await this.get(`/movie/${id}/similar`);

   
   return typeof response === "object"
      ? response.results.map((movie) => this.movieReducer(movie))
      : [];;
  }

  async getVideosByMovieId({id}) {
    const response = await this.get(`/movie/${id}/videos`);


    const types = {};
    response.results.forEach((vid, i) => {
      if (typeof types[`${vid.type}`] === "undefined") {
        types[`${vid.type}`] = [];
      }
      const video = this.videoReducer(vid)
      types[vid.type]?.push(video);
    });

    return types;
  }
  async getImagesByMovieId(id) {
    const response = await this.get(`/movie/${id}/images`);
    return response.backdrops.map((image) => this.ImageReducer(image));
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
      runtime:movie.runtime,
      genres:movie?.genres?.map((genre)=>genre.name)
    };
  }
  ImageReducer(image) {
    return {
      aspect_ratio: image.aspect_ratio,
      file_path: image.file_path,
      height: image.height,
      width: image.width,
    };
  }
}

module.exports = MovieAPI;
