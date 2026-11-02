const WebSocket = require('ws');

const target = process.env.WS_URL || 'ws://localhost:3000';
const totalClients = Number(process.env.WS_CLIENTS || process.argv[2] || 1000);

const sockets = [];
let connected = 0;
let finished = false;

function finish() {
  if (finished) return;
  finished = true;
  const elapsed = ((performance.now && performance.now()) || Date.now()) - start;
  console.log(`Connected ${connected}/${totalClients} clients in ${elapsed.toFixed(0)} ms.`);
  process.exit(0);
}

const start = Date.now();

for (let index = 0; index < totalClients; index += 1) {
  const socket = new WebSocket(target);
  sockets.push(socket);

  socket.addEventListener('open', () => {
    connected += 1;
    socket.send(JSON.stringify({ type: 'hello', client: `client-${index}` }));
    if (connected >= totalClients) {
      finish();
    }
  });

  socket.addEventListener('error', () => {
    console.warn(`Client ${index} failed to connect.`);
  });

  socket.addEventListener('close', () => {
    connected = Math.max(0, connected - 1);
  });
}

setTimeout(() => {
  if (connected < totalClients) {
    console.warn(`Only ${connected}/${totalClients} clients connected before timeout.`);
  }
  finish();
}, 10000);
