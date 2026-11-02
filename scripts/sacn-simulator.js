const dgram = require('node:dgram');
const { createArtDmxPacket } = require('../server/lighting');

const host = process.env.ARTNET_HOST || '127.0.0.1';
const port = Number(process.env.ARTNET_PORT || 6454);
const universe = Number(process.env.ARTNET_UNIVERSE || 1);
const sequence = Number(process.env.ARTNET_SEQUENCE || 1);
const channels = [
  255,
  160,
  72,
  180,
  0,
  1,
];

const packet = createArtDmxPacket({ universe, sequence, channels });
const socket = dgram.createSocket('udp4');

socket.send(packet, port, host, (error) => {
  if (error) {
    console.error('Art-Net simulator failed:', error.message || error);
    process.exitCode = 1;
  } else {
    console.log(`Art-Net DMX packet sent to ${host}:${port} on universe ${universe}`);
  }
  socket.close();
});
