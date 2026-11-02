const dgram = require('node:dgram');
const { createSacnPacket } = require('../server/lighting');

const host = process.env.SACN_HOST || '127.0.0.1';
const port = Number(process.env.SACN_PORT || 5568);
const universe = Number(process.env.SACN_UNIVERSE || 1);
const priority = Number(process.env.SACN_PRIORITY || 100); 
const sequence = Number(process.env.SACN_SEQUENCE || 1);
const channels = [
  40,
  100,
  220,
  160,
  128,
  2,
];

const packet = createSacnPacket({ universe, priority, sequence, sourceName: 'DemoConsole', channels });
const socket = dgram.createSocket('udp4');

socket.send(packet, port, host, (error) => {
  if (error) {
    console.error('sACN simulator failed:', error.message || error);
    process.exitCode = 1;
  } else {
    console.log(`sACN packet sent to ${host}:${port} on universe ${universe}`);
  }
  socket.close();
});
