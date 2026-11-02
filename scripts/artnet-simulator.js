const { execSync } = require('node:child_process');

const target = process.argv[2] || 'scripts/artnet-simulator.js';
execSync(`node ${target}`, { stdio: 'inherit' });
