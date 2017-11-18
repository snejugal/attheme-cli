# attheme-cli
A command-line interface for working with .attheme files
![Usage](https://image.ibb.co/mMFohm/output.gif)
## Installing
```
npm i -g attheme-cli
```
## Usage
Type `attheme` in the terminal, then select select the theme to work with:
```
path/to/working/directory>attheme
? Which theme do you want to open? (Use arrow keys)
> Create an empty theme
  Open the default theme
  Forest River
  <other themes from the working directory>
```
Then type the commands. The CLI will suggest commands and possible ending of them:
```
? Command: get gr
> get graySection
  get groupcreate_checkbox
(Move up and down to reveal more choices)
```
```
? Command: importwallaper one light
> importwallpaper one more light.jpg
```
### `help`
Shows the list of available commands.
### `get <variable> [<variable> [...]]`
### `valueof <variable> [<variable> [...]]`
Both commands show the hex and channels of the variables values, like this:
```
? Command: get windowBackgroundWhite chat_wallpaper avatar_backgroundViolet
windowBackgroundWhite
  Hex:   #ed4621
  Red:   237
  Green: 70
  Blue:  33
  Alpha: 255
chat_wallpaper is an image.
avatar_backgroundViolet is not added to the theme.
```
### `set <variable> [<variable> [...]] <value>`
Sets the values of the variable to `<value>`, then shows their value.
`<value>` may be a hex or rgb, like:
```
#fff // #rgb
#abcd // #argb
#1824cd // #rrggbb
#10b47c1a // #aarrggbb
124 234 43 // r g b
174 10 188 240 // r g b a
```
If some channel of the color is higher than 255, it gets normalized.
```
? Command: set avatar_backgroundViolet chat_wallpaper #63ba46
avatar_backgroundViolet
  Hex:   #63ba46
  Red:   99
  Green: 186
  Blue:  70
  Alpha: 255
chat_wallpaper
  Hex:   #63ba46
  Red:   99
  Green: 186
  Blue:  70
  Alpha: 255
```
If `chat_wallpaper` was previously an image, the image is removed.
### `delete <variable> [<variable> [...]]`
Deletes the variables in the theme and reports success.
```
? Command: delete graySection chat_wallpaper
The variables have been successfully deleted.
```
If `chat_wallpaper` is an image, it deletes it.
### `importwallpaper <path to the image>`
Imports the image from `<path to the image>` to the theme. The path may be only to `.jpg` files, it may contain spaces. If the extension is omitted, it is automatically put. Here, `Sepia Highway.jpg` is imported.
```
? Command: importwallpaper sepia highway
The wallpaper has been successfully imported.
```
### `exportwallpaper <path to the file>`
Exports the theme image into `<path to the file>`. If the `.jpg` extension is omitted, it is automatically put. Here, the wallaper is exported to `Forest River.jpg`:
```
? Command: exportwallaper Forest River
The wallpaper has been successfully exported.
```
If there's no image wallpaper in the theme, it won't export it.
### `save [<path to the file>]`
Saves the theme. If `<path to the file>` is specified, then it saves the theme over there.
```
? Command: save
The theme has been successfully saved.
```
If the theme is new or default and the path is not specified, it saves the theme to `Unnamed theme.attheme` or `Default theme.attheme` respectively.
### `exit`
Closes the CLI without saving the theme.