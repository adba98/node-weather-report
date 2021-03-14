const fs = require('fs');
const axios = require('axios').default;

class Busquedas {
  historial = [];
  dbPath = './db/database.json'

  constructor() {
    this.leerBD();
  }

  get historialCapitalizado() {
    return this.historial.map(lugar => {
      let palabras = lugar.split(' ');
      palabras = palabras.map(p => 
        p[0].toUpperCase() + p.substring(1)
      );
      return palabras.join(' ');
    })
  }

  get paramsMapbox() {
    return {
      'access_token': process.env.MAPBOX_KEY || '',
      'limit': 5,
      'language': 'es'
    }
  }

  get paramsOpenWeatherMap() {
    return {
      'appid': process.env.OPENWEATHER_KEY || '',
      'units': 'metric',
      'lang': 'es'
    }
  }

  async ciudad(lugar = '') {
    try {
      // Peticion http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox
      });

      const resp = await instance.get();

      return resp.data.features.map(lugar => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1]
      }));
    } catch (e) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      // Peticion http
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: {
          ...this.paramsOpenWeatherMap,
          lat,
          lon
        }
      });

      const resp = await instance.get();
      const { main, name, weather } = resp.data;

      return {
        descripcion: weather[0].description,
        name,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      }
    } catch (e) {
      console.log('ERROR peticion clima', e.status);
    }
  }

  agregarHistorial = (lugar = '') => {
    // Prevenir historial duplicado
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }
    this.historial = this.historial.splice(0,5);
    this.historial.unshift(lugar.toLocaleLowerCase());
    // Persistencia 
    this.guardarBD();

  }

  guardarBD() {
    const payload = {
      historial: this.historial
    }

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));

  }

  leerBD() {
    if (!fs.existsSync(this.dbPath)) return null;
    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}
module.exports = Busquedas;