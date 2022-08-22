const { RESTDataSource } = require("apollo-datasource-rest");

class SeriesAPI extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = "https://api.themoviedb.org/3/";
  }
  willSendRequest(request) {
    request.params.set("api_key", this.context.apiKey);
  }

  async getTopRatedSeries(page = 1) {
    const response = await this.get(`/tv/top_rated/?page=${page}`);

    return typeof response === "object"
      ? response.results.map((series) => this.SeriesReducer(series))
      : [];
  }

  async getTrendingSeries() {
    const response = await this.get(`trending/tv/week`);

    return typeof response === "object"
      ? response.results.map((series) => this.movieReducer(series))
      : [];
  }

  async getSeriesById(id) {
    const response = await this.get(`/tv/${id}`);
    return this.SeriesReducer(response);
  }
  async getVideosBySeriesId(id) {
    const response = await this.get(`/tv/${id}/videos`);
    return response.results.map((video) => this.videoReducer(video));
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
  SeriesReducer(series) {
    return {
      id: series.id,
      title: series.name,
      backdropPath: series.backdrop_path,
      posterPath: series.poster_path,
    };
  }
}

module.exports = SeriesAPI;
