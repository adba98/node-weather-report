require('dotenv').config();

const {
  leerInput,
  inquireMenu,
  pausa,
  listarLugares
} = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');


require('colors');

const main = async () => {
  const busquedas = new Busquedas();
  let opt = '';
  do {
    console.clear();
    opt = await inquireMenu();
    switch (opt) {
      case 1:
        // Mostrar msj
        const aBuscar = await leerInput('Ciudad: ');

        // Buscar lugares
        const lugares = await busquedas.ciudad(aBuscar);

        // Seleccionar lugar
        const idSeleccion = await listarLugares(lugares);
        if (idSeleccion === '0') continue;

        const lugarSel = lugares.find(l => l.id === idSeleccion);

        // Persistir en json
        busquedas.agregarHistorial(lugarSel.nombre);

        // Clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
        const { descripcion, name, min, max, temp } = clima;

        // Mostrar info de lugar
        console.clear();
        console.log('\nInformación de la ciudad\n'.cyan);
        console.log('Ciudad:', lugarSel.nombre.cyan);
        console.log('Lat', lugarSel.lat);
        console.log('Long', lugarSel.lng);
        console.log('Ubicación:', name.green);
        console.log('Temperatura', temp);
        console.log('Minima:', min);
        console.log('Maxima:', max);
        console.log('Descripción:', descripcion.cyan);
        break;
      case 2:
        console.log(busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        }));
        break;
    }
    if (opt !== 0) await pausa();
  } while (opt !== 0);
}

main();