function createSacnPacket({ universe = 1, priority = 100, sequence = 1, sourceName = 'Atmosphere', channels = [] }) {
  const packet = Buffer.alloc(126 + Math.max(512, channels.length || 512));
  packet.write('ACN-SDT', 0, 7, 'ascii');
  packet.write('\x00\x00\x00\x00', 7, 4, 'ascii');
  packet.write('ASC-E1.17', 12, 8, 'ascii');
  packet[20] = 0x00;
  packet[21] = 0x00;
  packet[22] = priority & 0xff;
  packet[23] = sequence & 0xff;
  packet.writeUInt16BE(universe & 0x0fff, 24);
  const sourceId = Buffer.alloc(16);
  sourceId.write(sourceName.slice(0, 15), 0, 'ascii');
  sourceId.copy(packet, 26);
