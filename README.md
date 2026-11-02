# Neighbourhood Glow

Neighbourhood Glow is a lightweight lighting control dashboard for community events, performances, or neighborhood installations. It exposes a local web UI for audience-facing visuals and admin controls, while sending lighting instructions through Art-Net and sACN protocols.

## Features

- Browser-based audience display and admin control panel
- WebSocket updates for live changes
- Art-Net controller abstraction
- sACN controller abstraction
- Shared protocol helpers for payload normalization
- Node-based test suite for protocol and controller behavior

## Tech stack

- Node.js
- Express
- WebSockets
- JavaScript (CommonJS)

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example config:
   ```bash
   cp config.example.json config.json
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open the app:
   - Audience view: http://localhost:3000/
   - Admin panel: http://localhost:3000/admin

## Project structure

```text
neighbourhood-glow/
├── package.json
├── config.example.json
├── .gitignore
├── README.md
├── server/
│   ├── index.js
│   ├── protocol.js
│   ├── artnet.js
│   └── sacn.js
├── public/
│   ├── index.html
│   ├── audience.css
│   ├── audience.js
│   ├── admin.html
│   ├── admin.css
│   ├── admin.js
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
│       ├── icon.svg
│       └── maskable.svg
├── scripts/
│   ├── artnet-simulator.js
│   ├── sacn-simulator.js
│   └── ws-load-test.js
└── test/
    ├── protocol.test.js
    ├── artnet.test.js
    └── sacn.test.js
```

## Notes

This repository is intentionally scaffolded to support a practical, extensible lighting-control workflow. The server exposes a minimal API for pushing scenes, while the UI and protocol files establish the foundation for future integration with actual hardware or an external streaming layer.
