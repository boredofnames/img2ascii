## About

WIP Ascii generator made with [SolidJS](https://solidjs.com/) and bundled with [Vite](https://vitejs.dev/). Includes quantization via [RgbQuant.js](https://github.com/leeoniya/RgbQuant.js/), color utils with [chroma.js](https://github.com/gka/chroma.js/), and image saving with [html-to-image](https://github.com/bubkoo/html-to-image).

## Demo

A working demo can be found at [https://img2ascii.ehmeh.com/](https://img2ascii.ehmeh.com/). It was tested and built in Chromium, possible unknown bugs elsewhere.

## Usage

```bash
$ npm install # or pnpm install or yarn install
```

## Available Scripts

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## Credits

- [CodingTrain](http//thecodingtrain.com/challenges/166-image-to-ascii) for the idea of using density based on light
- [P5.js](https://p5js.org/) for the map and constrain functions
- Trzcin for [Fira Code](https://github.com/Trzcin/Fira-Code-Nerd)
- All the devs of mentioned libs
