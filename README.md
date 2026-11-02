# Neighbourhood Glow

Neighbourhood Glow is a complete Progressive Web App and lighting-control server for Neighbourhood Church in Calgary, Alberta. The application serves an audience-facing light display, a secure admin dashboard, and live UDP input handling for Art-Net and sACN/ E1.31 sources.

## Features

- Audience PWA with live colour, brightness, pulse, fade, connection status, and announcement overlays
- Secure admin dashboard with PIN login and session cookies
- Art-Net DMX input listener on UDP 6454
- sACN/E1.31 DMX input listener on UDP 5568
- Channel mapping for six DMX channels required for the project
- Video cue playback and configurable cue list
- WebSocket live updates and automatic reconnect logic
- PWA manifest, service worker, and offline app-shell caching
- Node.js built-in test suite with protocol, arbitration, and WebSocket validation
- Simulators for Art-Net, sACN, and WebSocket load testing

## Technology

- Node.js 20+
- Express for HTTP serving
- WebSockets via the ws package
- UDP via the Node built-in dgram module
- HTML, CSS, and vanilla JavaScript
- Service worker and Web App Manifest for PWA support

## Installation

1. Install dependencies.

```bash
npm install
```

2. Create a local config file from the example if needed.

```bash
cp config.example.json config.json
```

3. Set the admin PIN in the environment if you want a custom value.

```bash
export ADMIN_PIN=8585
```

The app will fall back to `8585` during local development, but production deployments should change it before use.

## Configuration

The main configuration lives in `config.json` and can be copied from `config.example.json`.

Important settings:

- `port`: HTTP port for the app
- `artnet.listenPort`: UDP port for Art-Net input
- `sacn.listenPort`: UDP port for sACN input
- `lighting.defaultChannels`: default DMX values for the live scene
- `videos`: configurable video cue list
- `adminPinEnv` and `adminPin`: admin credentials. Do not expose the real PIN in browser JavaScript.

## Starting the server

Start the app in normal mode.

```bash
npm start
```

Start development mode with file watching.

```bash
npm run dev
```

## Accessing the application

- Audience page: http://localhost:3000/
- Admin dashboard: http://localhost:3000/admin.html
- Alternate admin route: http://localhost:3000/admin

## Admin authentication

The admin dashboard uses a PIN-based login. On success, the server sets a secure session cookie. The PIN is checked on the server only. The front-end does not contain the PIN or any secrets.

A production deployment should change the default demo PIN before exposing the app to staff or the public network.

## Art-Net setup

The server listens for ArtDMX packets on UDP port `6454` by default. Set `artnet.enabled` to `true` and configure `artnet.universe` and `artnet.listenPort` as needed.

- Default destination: UDP 6454
- Accepts unicast and broadcast UDP traffic
- Validates packet header, opcode, protocol version, and data length
- Checks for sequence continuity as part of frame handling
- Uses configured universe and source priority values for arbitration

## sACN setup

The server listens for E1.31 / sACN packets on UDP port `5568` by default. Use the `sacn` section in the config file to set the listening port, universe, and source priority. The implementation supports multicast and unicast, validates packet framing, and tracks source CID information.

Optional sACN features not implemented here are advanced per-address merging from multiple non-priority sources, full network discovery, and external RDM or metadata management. This app uses priority-based source arbitration and stale-source timeout handling.

## DMX channel map

The application uses the required 6-channel mapping:

- Channel 1: Red
- Channel 2: Green
- Channel 3: Blue
- Channel 4: Brightness
- Channel 5: Video cue
- Channel 6: Effect

Channel 5 values:

- 0-127: no video
- 128-255: select a configured video cue

Channel 6 values:

- 0: off
- 1: solid
- 2: slow pulse
- 3: gentle fade

A rapid strobe effect is intentionally not implemented.

## Video setup

The `videos` array in the config defines the cue list used by the admin interface and by DMX channel 5 selection. The audience display resolves the selected cue and starts playback based on a synchronized cue start time. Playback is best-effort across browsers because network jitter and browser autoplay restrictions mean frame-perfect synchronization is not guaranteed.

The app attempts to play the selected video automatically, but browsers may restrict autoplay until the user interacts with the page. In that case, the interface shows a small prompt or remains in a ready state until playback is allowed.

## HTTPS deployment

The app is HTTPS-ready. For production environments, run it behind a TLS terminator, reverse proxy, orconfigure a certificate. WebSockets support secure WSS connections through HTTPS.

Example architecture:

- Audience devices reach the HTTPS application server
- The light network remains isolated from audience devices
- Art-Net traffic is accepted only from the designated light controller
- sACN traffic is accepted only from approved sources
- Admin access is restricted to the staff network or a VPN

## Firewall rules

Open the required ports for the deployment:

- TCP 443 for HTTPS
- UDP 6454 for Art-Net
- UDP 5568 for sACN

For sACN multicast, ensure the switch supports multicast traffic and that IGMP snooping / multicast routing are enabled as required by your network design.

## Network isolation

Recommended deployment separation:

- Audience devices can reach the HTTPS application server
- Audience devices cannot reach lighting controllers or production hardware
- Art-Net receives only from the configured controller IP or approved sources
- sACN receives only from approved sources within the staff network
- Admin access is restricted to the staff network

## Testing

Run the automated tests.

```bash
npm test
```

Additional scripts:

```bash
npm run simulate:artnet
npm run simulate:sacn
npm run loadtest
```

The load-test script is designed to simulate a large number of WebSocket clients and estimate the behaviour of the server under a heavier audience load.

## Troubleshooting

- If the audience page does not load, check the Node process and the configured `port`.
- If the admin dashboard cannot log in, verify the PIN and cookie handling.
- If Art-Net or sACN input is missing, confirm UDP ports 6454 and 5568 are open and bound.
- If the audience display does not update, inspect the server logs and WebSocket connection state.
- If video playback is blocked, interact with the page to allow playback.

## Production security recommendations

- Change the default admin PIN before production deployment.
- Keep admin access on a private staff network or VPN.
- Do not leave `config.json` in a public repository.
- Use HTTPS and restrict inbound traffic to required ports.
- Validate every incoming packet and any user-submitted input before applying changes.
- Use rate limiting and heartbeat checks for large audience deployments.

## License

This project is created for Neighbourhood Church and is intended for local event or campus installation usage.
