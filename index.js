const inquirer = require('inquirer');
const _ = require('lodash');

inquirer.registerPrompt('command', require('inquirer-command-prompt'));
inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

(async () => {
  const commands = {
    'query all': () => {
    },
    'query one': () => {
    },
    exit: () => {
      console.log('Goodbye!');
    },
    help: () => {
      console.log('There is no help!');
    },
  };
  const validator = input => _.filter(_.keys(commands), cmd => cmd.includes(input)).length > 0;
  const filter = input => input.trim().replace(/\s+/, ' ');
  const processCommand = async (cmd) => {
    commands[cmd]();
    return cmd !== 'exit';
  };

  let keepRunning = true;
  while (keepRunning) { // eslint-disable-next-line
    const { input } = await inquirer.prompt([
      {
        type: 'command',
        name: 'input',
        message: '#',
        validate: validator,
        filter,
        autoCompletion: _.keys(commands),
        short: false,
      },
    ]);

    // eslint-disable-next-line
    keepRunning = await processCommand(input);
  }
})();
