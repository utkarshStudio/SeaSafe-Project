import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AisDecode from '../node_modules/ais-nmea-decoder/src/ais-decode.js';

const HOST = '153.44.253.115';
const PORT = 10110;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const activeShips = new Map();
const sessionCache = {}; // session cache for multipart messages

const CACHE_DIR = path.join(__dirname, '../public/data');
const CACHE_FILE = path.join(CACHE_DIR, 'live-ais-cache.json');

// Ensure directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function saveCache() {
  const list = Array.from(activeShips.values());
  const now = Date.now();
  
  // Keep only vessels active in the last 10 minutes
  const activeList = list.filter(s => now - s.updatedAt < 10 * 60 * 1000);
  
  // Keep only up to 100 recent vessels
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
      // Decode the sentence using AisDecode class
      const decoded = new AisDecode(trimmed, sessionCache);
      if (decoded && decoded.mmsi) {
        const mmsi = decoded.mmsi;
        const existing = activeShips.get(mmsi) || {};

        // Extract attributes
        const lon = decoded.lon;
        const lat = decoded.lat;
        
        let name = decoded.shipname || decoded.shipName || '';
        if (name) name = name.replace(/@+$/, '').trim(); // Strip trailing @ signs
        
        const type = decoded.GetVesselType ? decoded.GetVesselType() : '';
        const heading = decoded.heading !== undefined ? decoded.heading : (decoded.cog || 0);
        const imo = decoded.imo || '';

        const ship = {
          mmsi,
          name: name ? name : (existing.name || `Vessel ${mmsi}`),
          imo: imo ? String(imo) : (existing.imo || ''),
          type: (type && type !== 'Undefined') ? type : (existing.type || 'Cargo Ship'),
          position: (lon !== undefined && lat !== undefined && Math.abs(lon) <= 180 && Math.abs(lat) <= 90) 
            ? [lon, lat] 
            : existing.position,
          headingDeg: heading || existing.headingDeg || 0,
          updatedAt: Date.now()
        };

        // Only cache ships that we can at least map
        activeShips.set(mmsi, ship);
      }
    } catch (e) {
      // Ignore decoding errors for malformed NMEA sentences
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
