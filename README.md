# Atmosphere

Atmosphere is a complete Progressive Web App and lighting-control server for Neighbourhood Church in Calgary, Alberta. The project serves an audience-facing light display, secure admin control, and live scene management for immersive worship and event experiences.

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

The app uses a local config file based on `config.example.json`.

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

This project is created for Neighbourhood Church and licensed personal
