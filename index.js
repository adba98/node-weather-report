require('dotenv').config();
require('colors');

const {
  inquireMenu,
  selectPlaceFromList,
  pause,
  readInput,
} = require('./helpers/inquirer');
const SearchManager = require('./models/SearchManager');

const main = async () => {
  const searchManager = new SearchManager();
  let choices = '';
  do {
    console.clear();
    choices = await inquireMenu();
    switch (choices) {
      case 1:
        const placeToSearch = await readInput();
        const places = await searchManager.searchPlace(placeToSearch);

        const idPlaceSelected = await selectPlaceFromList(places);
        if (idPlaceSelected === '0') continue;

        const placeSelected = places.find(({ id }) => id === idPlaceSelected);
        const { name: place, latitude, longitude } = placeSelected;
        searchManager.addHistory(place);

        const climate = await searchManager.checkWeather(latitude, longitude);
        const { description, name, min, max, temp } = climate;

        console.clear();
        console.log(`\nInformation to ${place}`.cyan);
        console.log(`Location: ${name.green}`);
        console.log(`Description: ${description.cyan}`);
        console.log(`Latitude: ${latitude}`);
        console.log(`Longitude: ${longitude}`);
        console.log(`Temperature: ${temp}°C`);
        console.log(`Maximum: ${min}°C`);
        console.log(`Minimum: ${max}°C`);
        break;
      case 2:
        searchManager.searchHistory.forEach((place, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${place}`);
        });
        break;
    }
    if (choices !== 3) await pause();
  } while (choices !== 3);
};

main();
