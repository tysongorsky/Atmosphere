const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
  console.log('WebSocket connected');

  for (let i = 0; i < 10; i += 1) {
    socket.send(JSON.stringify({
      scene: 'pulse',
      channels: [120 + i, 140 + i, 165 + i, 200 + i],
    }));
  }
});

socket.addEventListener('message', (event) => {
  console.log('Message received:', event.data.toString());
});

socket.addEventListener('error', (error) => {
  console.error('WebSocket error:', error.message || error);
});
