const net = require('net');
const fs = require('fs');
const path = require('path');
const { AisDecoder } = require('ais-nmea-decoder');

const HOST = '153.44.253.115';
const PORT = 10110;

const decoder = new AisDecoder();
const activeShips = new Map();

// Save cache file path
const CACHE_DIR = path.join(__dirname, '../public/data');
const CACHE_FILE = path.join(CACHE_DIR, 'live-ais-cache.json');

// Ensure directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function saveCache() {
  const list = Array.from(activeShips.values());
  
  // Filter out ships that have been inactive for more than 5 minutes
  const now = Date.now();
  const activeList = list.filter(s => now - s.updatedAt < 5 * 60 * 1000);
  
  // Sort and keep only the most recent 100 ships
  const recent = activeList
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 100);
  
  fs.writeFileSync(CACHE_FILE, JSON.stringify(recent, null, 2));
  console.log(`[AIS Cache] Saved ${recent.length} active vessels to ${CACHE_FILE}`);
}

// Write to cache file every 3 seconds
setInterval(saveCache, 3000);

console.log(`Connecting to Kystverket live AIS stream at ${HOST}:${PORT}...`);
const socket = new net.Socket();

function connect() {
  socket.connect(PORT, HOST, () => {
    console.log(`CONNECTED successfully to Kystverket AIS stream.`);
  });
}

connect();

let buffer = '';
socket.on('data', (chunk) => {
  buffer += chunk.toString();
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() || ''; // Keep incomplete last line in buffer

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('!AIVDM') && !trimmed.startsWith('!AIVDO')) {
      continue;
    }
    
    try {
      const decoded = decoder.parse(trimmed);
      if (decoded && !decoded.error && !decoded.pending && decoded.mmsi) {
        const lon = decoded.lon !== undefined ? decoded.lon : decoded.longitude;
        const lat = decoded.lat !== undefined ? decoded.lat : decoded.latitude;
        
        const name = decoded.name || decoded.shipname || decoded.shipName || `MMSI ${decoded.mmsi}`;
        const type = decoded.type || decoded.shipTypeString || "Vessel";
        const heading = decoded.heading !== undefined ? decoded.heading : (decoded.cog || 0);
        const imo = decoded.imo || '';

        const existing = activeShips.get(decoded.mmsi) || {};
        
        const ship = {
          mmsi: decoded.mmsi,
          name: name !== `MMSI ${decoded.mmsi}` ? name : (existing.name || name),
          imo: imo || existing.imo || '',
          type: type !== 'Vessel' ? type : (existing.type || type),
          position: (lon !== undefined && lat !== undefined) ? [lon, lat] : existing.position,
          headingDeg: heading,
          updatedAt: Date.now()
        };

        // Only add to active ships list if it has a valid name and position
        if (ship.position && ship.name) {
          activeShips.set(decoded.mmsi, ship);
        }
      }
    } catch (e) {
      // Ignore decoding errors
    }
  }
});

socket.on('close', () => {
  console.log('Connection closed. Reconnecting in 5 seconds...');
  setTimeout(connect, 5000);
});

socket.on('error', (err) => {
  console.error('Socket error:', err.message);
  socket.destroy();
});
