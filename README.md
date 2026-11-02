# Atmosphere

Atmosphere is a complete Progressive Web App and lighting-control server for immersive audience experiences. It provides an audience-facing light display, admin controls, and live scene updates.

## Quick start

### Requirements

- Node.js 20 or newer (npm is included with Node.js)

### Install and run

```bash
# Install dependencies
npm install

# Create your local configuration file
cp config.example.json config.json

# Start the server
npm start
```

Then open:

- Audience page: http://localhost:3000/
- Admin dashboard: http://localhost:3000/admin.html

The server uses port 3000 by default. To run in development mode with file watching, use `npm run dev` instead of `npm start`.

## Features

- Audience-facing light display with colour, brightness, pulse, and fade effects
- Admin dashboard for scene and lighting control
- Art-Net DMX listener on UDP port 6454
- sACN/E1.31 DMX listener on UDP port 5568
- WebSocket live updates between audience and admin views
- PWA support with manifest and service worker
- HTML, CSS, and vanilla JavaScript front end
- Node.js server runtime with Express and WebSockets

## Technology

- Node.js 20+
- Express
- WebSockets via the `ws` package
- UDP networking via Node built-ins
- HTML, CSS, and JavaScript

## Installation

From the project root, install dependencies:

```bash
npm install
```

## Run the app

Start the server in normal mode:

```bash
npm start
```

Start development mode with file watching:

```bash
npm run dev
```

## Access the application

- Audience page: http://localhost:3000/
- Admin dashboard: http://localhost:3000/admin.html
- Alternate admin route: http://localhost:3000/admin

## Configuration

The app uses a local config file based on `config.example.json`. Copy it to `config.json` before starting the server:

```bash
cp config.example.json config.json
```

Key settings include:

- `port`: HTTP port for the app
- `artnet.listenPort`: UDP port for Art-Net input
- `sacn.listenPort`: UDP port for sACN input
- `lighting.defaultChannels`: default DMX values for the live scene
- `videos`: video cue list

## Testing

Run the automated tests:

```bash
npm test
```

Additional scripts:

```bash
npm run simulate:artnet
npm run simulate:sacn
npm run loadtest
```

## Troubleshooting

- If the web app does not load, confirm the Node process is running and the configured port is correct.
- If the admin dashboard cannot connect, check the WebSocket connection and browser console.
- If Art-Net or sACN input is missing, confirm UDP ports 6454 and 5568 are open.
- If the audience display is not updating, inspect the server logs and WebSocket state.

## License

This project is licensed personal
