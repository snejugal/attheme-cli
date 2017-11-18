#!/usr/bin/env node
(async () => {
  `use strict`;
  try {
    const inquirer = require(`inquirer`);
    const fs = require(`./promise-fs`);
    const colors = require(`colors`);
    const directory = `${process.cwd()}/`;
    const Attheme = require(`attheme-js`);
    const defaultValues = require(`attheme-default-values`);
    const correctNames = {};
    const variables = Object.keys(defaultValues);
    const autocomplete = require(`inquirer-autocomplete-prompt`);
    const fuzzy = require(`fuzzyfind`);
    let theme;
    let themeName;

    variables.forEach((variable) => {
      const iterableName = variable.toLowerCase().replace(/\_/, ``);
      correctNames[iterableName] = variable;
    });

    inquirer.registerPrompt(`autocomplete`, autocomplete);
    const showValue = (variable) => {
      if (variable == `chat_wallpaper` && Attheme.IMAGE_KEY in theme) {
        console.log(
          `chat_wallpaper`.yellow,
          `is an image.`,
        );
      } else if (variable in theme) {
        const { red, green, blue, alpha } = theme[variable];
        let hex = `#`;
        if (alpha != 255) {
          hex += alpha.toString(16).padStart(2, 0);
        }
        hex += red.toString(16).padStart(2, 0);
        hex += green.toString(16).padStart(2, 0);
        hex += blue.toString(16).padStart(2, 0);
        console.log(
          variable,
          `\n  Hex:  ${hex.cyan}`,
          `\n  Red:  `.red, red,
          `\n  Green:`.green, green,
          `\n  Blue: `.blue, blue,
          `\n  Alpha:`.gray, alpha,
        );
      } else {
        console.log(
          variable.yellow,
          `is not added to the theme.`,
        );
      }
    };
    const prompt = async () => {
      const commands = [
        `help `,
        `valueof `,
        `get `,
        `set `,
        `delete `,
        `exportwallpaper `,
        `importwallpaper `,
        `save `,
        `exit `,
      ];

      let atthemeFilesCache;
      let imageFilesCache;
      const loadAtthemeFilesCache = () => {
        return new Promise(async (resolve, reject) => {
          const files = await fs.readdir(directory);
          atthemeFilesCache = files.filter((x) => x.endsWith(`.attheme`));
          resolve();
        });
      };
      const loadImageFilesCache = () => {
        return new Promise(async (resolve, reject) => {
          const files = await fs.readdir(directory);
          imageFilesCache = files.filter((x) => x.endsWith(`.jpg`));
          resolve();
        });
      };

      const { input } = await inquirer.prompt({
        type: `autocomplete`,
        message: `Command:`.reset,
        name: `input`,
        suggestOnly: true,
        pageSize: 2,
        source(answer, userInput) {
          return new Promise(async (resolve, reject) => {
            const input = (userInput || ``).trim().toLowerCase();
            let prediction;

            if (input.includes(` `)) {
              const [command, ...options] = input.split(` `);
              const lastOption = String(options.slice(-1)).toLowerCase();
              let enteringFile;
              switch (command) {
                case `set`:
                  if (/^\d|^#/.test(lastOption)) {
                    resolve([``]);
                    break;
                  }
                case `valueof`:
                case `delete`:
                case `get`:
                  const enteringVariable = lastOption
                    .toLowerCase()
                    .replace(/[\_\*\-\s]/g, ``);
                  prediction = fuzzy(enteringVariable, variables)
                    .map((variable) => {
                      let result = command;
                      options.slice(0, -1).forEach((variable) => {
                        variable = variable.replace(/\_/g, ``);
                        result += ` ${correctNames[variable]}`;
                      });
                      result += ` ${variable} `;
                      return result;
                    });
                  resolve(prediction);
                  break;
                case `save`:
                  enteringFile = options.join(` `).toLowerCase();
                  if (!atthemeFilesCache) {
                    await loadAtthemeFilesCache();
                  }
                  prediction = fuzzy(enteringFile, atthemeFilesCache)
                    .map((file) => `${command} ${file}`);
                  resolve(prediction);
                  break;
                case `importwallpaper`:
                case `exportwallpaper`:
                  enteringFile = options.join(` `).toLowerCase();
                  if (!imageFilesCache) {
                    await loadImageFilesCache();
                  }
                  prediction = fuzzy(enteringFile, imageFilesCache)
                    .map((file) => `${command} ${file}`);
                  resolve(prediction);
                  break;
                default:
                  resolve([``]);
              }
            } else {
              const prediction = commands.filter((command) => {
                return command.startsWith(input);
              });
              resolve(prediction);
            }
          });
        }
      });
      let [command, ...options] = (input || ``).trim().split(` `);
      let path;
      main: switch (command) {
        case `get`:
        case `valueof`:
          await (async () => {
            const variables = options.filter((x) => Boolean(x));
            variables.forEach((variable) => {
              showValue(variable);
            });
          })();
          break;
        case `delete`:
          await (async () => {
            const variables = options.filter((x) => Boolean(x));
            variables.forEach((variable) => {
              if (variable == `chat_wallpaper`) {
                delete theme[Attheme.IMAGE_KEY];
              }
              delete theme[variable];
            });
            console.log(`The variables have been successfully deleted.`.green);
          })();
          break;
        case `set`:
          const variables = [];
          const value = [];
          let lastState = ``;
          options = options.filter((x) => Boolean(x));
          for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (/^\d/.test(option)) {
              if (lastState == `hex`) {
                console.log(`Wrong syntax of the command.`.red);
                break main;
              }
              if (value.length > 4) {
                console.log(`Too much channels of a color.`.red);
                break main;
              }
              lastState = `number`;
              value.push(option);
            } else if (/^#/.test(option)) {
              if (lastState == `number` || lastState == `hex`) {
                console.log(`Wrong syntax of the command.`.red);
                break main;
              }

              let alpha = 255;
              let red;
              let green;
              let blue;

              switch (option.length) {
                case 4:
                  red = parseInt(option.slice(1, 2).repeat(2), 16);
                  green = parseInt(option.slice(2, 3).repeat(2), 16);
                  blue = parseInt(option.slice(3, 4).repeat(2), 16);
                  break;
                case 5:
                  alpha = parseInt(option.slice(1, 2).repeat(2), 16);
                  red = parseInt(option.slice(2, 3).repeat(2), 16);
                  green = parseInt(option.slice(3, 4).repeat(2), 16);
                  blue = parseInt(option.slice(4, 5).repeat(2), 16);
                  break;
                case 7:
                  red = parseInt(option.slice(1, 3), 16);
                  green = parseInt(option.slice(3, 5), 16);
                  blue = parseInt(option.slice(5, 7), 16);
                  break;
                case 9:
                  alpha = parseInt(option.slice(1, 3), 16);
                  red = parseInt(option.slice(3, 5), 16);
                  green = parseInt(option.slice(5, 7), 16);
                  blue = parseInt(option.slice(7, 9), 16);
                  break;
                default:
                  console.log(`Wrong syntax of the command.`.red);
                  return;
              }
              value.push(red, green, blue, alpha);
            } else {
              if (lastState == `hex` || lastState == `number`) {
                console.log(`Wrong syntax of the command.`.red);
                return;
              }
              variables.push(option);
            }
          }
          switch (value.length) {
            case 0:
              console.log(`The value is not specified.`.red);
              break main;
            case 1:
            case 2:
              console.log(`The value is not full.`.red);
              break main;
            case 3:
              value.push(255);
              break;
          }
          if (variables.includes(`chat_wallpaper`)) {
            delete Attheme.IMAGE_KEY;
          }

          value.map(x => Math.max(Math.min(255, x), 0));

          variables.forEach((variable) => {
            theme[variable] = {
              red: value[0],
              green: value[1],
              blue: value[2],
              alpha: value[3],
            };
            showValue(variable);
          });
          break;
        case `save`:
          let themePath = options.join(` `) || themeName;

          if (!themePath.endsWith(`.attheme`)) {
            themePath += `.attheme`;
          }
          path = `${directory}${themePath}`;
          const themeContent = Buffer.from(Attheme.asText(theme), `binary`);
          await fs.writeFile(path, themeContent.toString(`base64`), `base64`);
          console.log(`The theme has been successfully saved.`.green);
          break;
        case `exportwallpaper`:
          if (!theme[Attheme.IMAGE_KEY]) {
            console.log(`The theme doesn't contain an image wallpaper.`);
            break main;
          }
          let imagePath = options.join(` `) || themeName;

          if (!imagePath.endsWith(`.jpg`)) {
            imagePath += `.jpg`;
          }
          path = `${directory}${imagePath}`;
          const image = Buffer.from(theme[Attheme.IMAGE_KEY], `binary`);
          await fs.writeFile(path, image.toString(`base64`), `base64`);
          console.log(`The wallpaper has been successfully exported.`.green);
          break;
          case `importwallpaper`:
          try {
            let imagePath = options.join(` `) || themeName;
            if (!imagePath.endsWith(`.jpg`)) {
              imagePath += `.jpg`;
            }
            path = `${directory}${imagePath}`;
            const image = await fs.readFile(path);
            theme[Attheme.IMAGE_KEY] = image.toString(`binary`);
            if (`chat_wallpaper` in theme) {
              delete theme.chat_wallpaper;
            }
            console.log(`The wallpaper has been successfully imported.`.green);
          } catch (error) {
            console.log(`Ooops, an error happend. Are you sure the file exists? Only .jpg is supported.`.red);
          }
          break;
        case ``:
          break;
        case `exit`:
          process.exit(0);
          break;
        case `help`:
          console.log(
            ` help\n`.yellow,
            `  shows the list of commands.\n`,
            `valueof <variable> [<variable> [...]]\n`.yellow,
            `get <variable> [<variable> [...]]\n`.yellow,
            `  both commands show the value of the variables.\n`,
            `set <variable> [<variable> [...]] <value>\n`.yellow,
            `  sets the value of the variableы to <value>. <value> may be either #rgb, #argb, #rrggbb, #aarrggbb or r g b [a] (ints from 0 to 255)\n`,
            `delete <variable> [<variable> [...]]\n`.yellow,
            `  deletes the variables in the theme.\n`,
            `exportwallpaper <file>\n`.yellow,
            `  exports the wallpaper of the theme to <file>.\n`,
            `importwallpaper <file>\n`.yellow,
            `  imports the image from <file> into the theme.\n`,
            `save [<file>]\n`.yellow,
            `  saves the theme. If <file> is specified, then the theme will be saved into it.\n`,
            `exit\n`.yellow,
            `  closes the CLI without saving the theme.`,
            `\nMore complete description of commands is on npmjs.com/package/attheme-js.`
          )
          break;
        default:
          console.log(
            `Unknown command. Type`,
            `help`.cyan,
            `to see the list of commands.`,
          );
      }
      prompt();
    };

    const directoryFiles = await fs.readdir(directory);
    const availableThemes = directoryFiles
      .filter((fileName) => fileName.endsWith(`.attheme`))
      .map((themeName) => ({
        name: themeName.slice(0, -8),
        value: themeName,
        short: themeName.slice(0, -8),
      }));

    availableThemes.unshift(
      {
        name: `Create an empty theme`,
        value: `emptyTheme`,
        short: `A new empty theme`,
      },
      {
        name: `Open the default theme`,
        value: `defaultTheme`,
        short: `The default theme`,
      },
    );


    const { selectedTheme } = await inquirer.prompt({
      type: `list`,
      name: `selectedTheme`,
      message: `Which theme do you want to open?`.reset,
      choices: availableThemes,
    });

    if (selectedTheme.endsWith(`.attheme`)) {
      const themeFile = await fs.readFile(`${directory}${selectedTheme}`);
      themeName = selectedTheme;
      const themeContent = themeFile.toString(`binary`);
      theme = new Attheme(themeContent);
      prompt();
    } else {
      switch (selectedTheme) {
        case `defaultTheme`:
          theme = new Attheme(null, defaultValues);
          themeName = `Default theme.attheme`;
          break;
        case `emptyTheme`:
          theme = new Attheme();
          themeName = `Unnamed theme.attheme`;
          break;
      }
      prompt();
    }
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();