require('colors');
const inquirer = require('inquirer');

const choices = [
  { value: 1, name: 'Find a place' },
  { value: 2, name: 'View history' },
  { value: 3, name: 'Exit' },
].map((choice) => ({
  ...choice,
  name: `${`${choice.value.toString()}.`.cyan} ${choice.name}`,
}));

const menu = {
  type: 'list',
  name: 'choices',
  message: 'What do you want to do?',
  choices,
};

const inquireMenu = async () => {
  console.log('==================='.cyan);
  console.log(' Select an option '.black.bgCyan);
  console.log('==================='.cyan);

  const { choices } = await inquirer.prompt(menu);
  return choices;
};

const readInput = async () => {
  const question = {
    type: 'input',
    name: 'place',
    message: 'Place:',
    validate(value) {
      return value.trim().length !== 0 || 'Please enter a value';
    },
  };
  const { place } = await inquirer.prompt(question);
  return place;
};

const selectPlaceFromList = async (places = []) => {
  const choices = places.map(({ id, name }, i) => {
    const idx = `${i + 1}.`.cyan;
    return {
      value: id,
      name: `${idx} ${name}`,
    };
  });

  choices.unshift({ value: '0', name: `${'0.'.cyan} Cancel` });

  const question = {
    type: 'list',
    name: 'id',
    message: 'Select a place:',
    choices,
  };
  const { id } = await inquirer.prompt(question);
  return id;
};

const pause = async () => {
  const question = {
    type: 'input',
    name: 'enter',
    message: `Press ${'ENTER'.cyan} to continue`,
  };
  console.log();
  await inquirer.prompt(question);
};

module.exports = {
  inquireMenu,
  pause,
  readInput,
  selectPlaceFromList,
};
