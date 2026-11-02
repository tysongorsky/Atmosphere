const test = require('node:test');
const assert = require('node:assert/strict');
const { createHttpServer, defaultPin } = require('../server');
const WebSocket = require('ws');

let server;

test.before(async () => {
  server = createHttpServer();
});

test('WebSocket authentication accepts the valid admin PIN', async () => {
  await new Promise((resolve, reject) => {
    const socket = new WebSocket('ws://localhost:3000');
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'auth', pin: defaultPin }));
    });
    socket.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'auth') {
        assert.equal(parsed.success, true);
        socket.close();
        resolve();
      }
    });
    socket.on('error', reject);
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});
