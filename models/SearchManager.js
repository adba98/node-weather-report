const fs = require('fs');
const axios = require('axios').default;

class SearchManager {
  history = [];
  DB_PATH = './db/database.json';
  MAP_BOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  constructor() {
    this.leerDB();
  }

  get paramsMapBox() {
    return {
      access_token: process.env.MAP_BOX_KEY || '',
      limit: 5,
      language: 'es',
    };
  }

  get paramsOpenWeatherMap() {
    return {
      appid: process.env.OPENWEATHER_KEY || '',
      units: 'metric',
      lang: 'es',
    };
  }

  get searchHistory() {
    return this.history.map((place) =>
      place
        .split(' ')
        .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
        .join(' ')
    );
  }

  leerDB() {
    if (!fs.existsSync(this.DB_PATH)) return null;
    const data = fs.readFileSync(this.DB_PATH, { encoding: 'utf-8' });
    const { history } = JSON.parse(data);
    this.history = history;
  }

  async searchPlace(place) {
    try {
      const instance = axios.create({
        baseURL: `${this.MAP_BOX_API_URL}/${place}.json`,
        params: this.paramsMapBox,
      });

      const resp = await instance.get();
      const { features } = resp.data;

      return features.map(({ id, place_name, center }) => ({
        id,
        name: place_name,
        longitude: center[0],
        latitude: center[1],
      }));
    } catch (_) {
      return [];
    }
  }

  addHistory = (place = '') => {
    const lowercasePlace = place.toLowerCase();
    if (this.history.includes(lowercasePlace)) return;

    this.history = this.history.splice(0, 5);
    this.history.unshift(lowercasePlace);

    this.saveDB();
  };

  saveDB() {
    const payload = { history: this.history };
    fs.writeFileSync(this.DB_PATH, JSON.stringify(payload));
  }

  async checkWeather(latitude, longitude) {
    try {
      const instance = axios.create({
        baseURL: this.WEATHER_API_URL,
        params: {
          ...this.paramsOpenWeatherMap,
          lat: latitude,
          lon: longitude,
        },
      });

      const resp = await instance.get();
      const { main, name, weather } = resp.data;

      return {
        description: weather[0].description,
        name,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (e) {
      throw new Error(`Weather request error. Error Code: ${error.status}`);
    }
  }
}

module.exports = SearchManager;
