This is a simple Electron-based app that allows a [Walden][] save
game's journal to be exported to a variety of formats.

<img src="https://user-images.githubusercontent.com/124687/36953340-e8a7e7fa-1fe7-11e8-9f09-3ecfa828c351.png">

<img src="https://user-images.githubusercontent.com/124687/36953341-e8b30766-1fe7-11e8-9b8d-9a3513b47483.png">

## Quick start

You'll need [NodeJS][] 8 or later.

After cloning the repository, run:

```
npm install
```

Then run:

```
npm run gui
```

## Development

To start the auto-reloading development server, run:

```
npm start
```

Note that the project uses [TypeScript][].

In a separate terminal, you can run `npm run gui` to start the
[Electron][]-based GUI. Any changes you make to the renderer process
code (generally located in `src/gui/renderer`) will only require a
page reload in Electron, but changes made to the main process will
require aborting and re-running `npm run gui`.

### Packaging

Currently, packaging the app into ZIP files for Windows and OS X
is only (easily) supported on Windows machines with Docker
installed.

To package everything, run:

```
npm run package-all
```

This will create ZIP files for distribution in the `release-builds`
directory.

## Example CLI usage

In addition to the GUI, a command-line interface is also available
via `node dist/cli.js`.

Running it without any arguments will show you a list of saved game
slots:

```bash
$ node dist/cli.js
Usage: cli.js <save-slot>

save-slot can be one of:

  0 - Emerson's House (8:23 PM, 02/18/2018)
  1 - Cabin (6:31 PM, 02/18/2018)
  2 - Little Cove (6:54 PM, 02/18/2018)
  3 - Cabin (7:52 PM, 02/18/2018)
  4 - Cabin (7:37 PM, 02/18/2018)
```

Note that the app will attempt to automatically find the Walden directory;
if it can't find it, though, you'll have to define the `WALDEN_DIR`
environment variable to point at it.

Once you've decided on a slot, you can re-run the app with the slot
number to display its journal:

```bash
$ node dist/cli.js 3
# Journal, 1845

## Early Summer

I went to the woods because I wished to live deliberately, to front only the essential facts of life, and not, when I came to die, discover that I had not lived. I wanted to live deep and suck out all the marrow of life, to live so sturdily and Spartan-like as to reduce it to its lowest terms, and, if it proved to be mean, to get the whole and genuine meanness of it, or if it were sublime, to know it by experience, and to give a true account of it.
```

The output is directed to stdout, so it can be piped to a file or the
clipboard (via e.g. `clip` on Windows or `pbcopy` on OS X).

## License

All code is licensed under CC0 (public domain).

[Walden]: https://www.waldengame.com/
[NodeJS]: https://nodejs.org/en/
[TypeScript]: http://www.typescriptlang.org/
[Electron]: https://electronjs.org/
