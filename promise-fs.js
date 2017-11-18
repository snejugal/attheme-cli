(() => {
  `use strict`;

  const fs = require(`fs`);
  const { promisify } = require(`util`);

  const readdir = promisify(fs.readdir);
  const readFile = promisify(fs.readFile);
  const writeFile = promisify(fs.writeFile);

  module.exports = {
    readdir,
    readFile,
    writeFile,
  };
})();