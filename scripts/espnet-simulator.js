const dgram = require('node:dgram');
const { createEspNetPacket } = require('../server/espnet');

const host = process.env.ESPNET_HOST || '127.0.0.1';
const port = Number(process.env.ESPNET_PORT || 3333);
const universe = Number(process.env.ESPNET_UNIVERSE || 1);
const channels = [255, 160, 72, 180, 0, 1];
const packet = createEspNetPacket({ universe, channels });
const socket = dgram.createSocket('udp4');

socket.send(packet, port, host, (error) => {
  if (error) {
    console.error('ESP-NET simulator failed:', error.message || error);
    process.exitCode = 1;
  } else {
    console.log(`ESP-NET DMX packet sent to ${host}:${port} on universe ${universe}`);
  }
  socket.close();
});
