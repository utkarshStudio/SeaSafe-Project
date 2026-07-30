import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load env from .env.local
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*AISSTREAM_API_KEY\s*=\s*(.+)$/);
      if (match) {
        process.env.AISSTREAM_API_KEY = match[1].trim();
      }
    }
  }
} catch (e) {
  console.error("Failed to load .env.local manually:", e);
}

const HOST = 'wss://stream.aisstream.io/v0/stream';
const API_KEY = process.env.AISSTREAM_API_KEY || "YOUR_FREE_API_KEY_HERE";

const activeShips = new Map();

const CACHE_DIR = path.join(__dirname, '../public/data');
const CACHE_FILE = path.join(CACHE_DIR, 'live-ais-cache.json');

// Ensure directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function saveCache() {
  const list = Array.from(activeShips.values());
  const now = Date.now();
  
  // Keep only vessels active in the last 30 minutes
  const activeList = list.filter(s => now - s.updatedAt < 30 * 60 * 1000);
  
  // Sort and keep only the most recent 1000 vessels
  const recent = activeList
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 1000);
  
  fs.writeFileSync(CACHE_FILE, JSON.stringify(recent, null, 2));
  console.log(`[AIS WebSocket Cache] Saved ${recent.length} active vessels to ${CACHE_FILE}`);
}

// Write to cache file every 3 seconds
setInterval(saveCache, 3000);

if (API_KEY === "YOUR_FREE_API_KEY_HERE") {
  console.warn("\n========================================================");
  console.warn("WARNING: Please set the AISSTREAM_API_KEY environment variable");
  console.warn("to your free API key from https://aisstream.io/");
  console.warn("========================================================\n");
}

let socket;
function connect() {
  console.log(`Connecting to aisstream.io global WebSocket stream...`);
  
  // Using native WebSocket supported in Node.js 22+
  socket = new WebSocket(HOST);

  socket.onopen = () => {
    console.log(`CONNECTED successfully to aisstream.io WebSocket! Sending subscription...`);
    
    // Subscribe to Gulf of Aden / Red Sea, Strait of Hormuz, and Strait of Malacca bounding boxes
    const subscription = {
      APIKey: API_KEY,
      BoundingBoxes: [
        [[5, 30], [32, 65]],   // Red Sea + Gulf of Aden + Arabian Sea + Persian Gulf / Hormuz
        [[-5, 90], [20, 115]]   // Strait of Malacca + Singapore Strait + Andaman Sea
      ],
      FilterMessageTypes: ["PositionReport"]
    };
    
    socket.send(JSON.stringify(subscription));
  };

  socket.onmessage = async (event) => {
    try {
      const rawStr = typeof event.data.text === 'function'
        ? await event.data.text()
        : event.data.toString();
      
      const message = JSON.parse(rawStr);
      if (message.MessageType === "PositionReport" && message.MetaData) {
        const metadata = message.MetaData;
        const payload = message.Message.PositionReport;
        
        const mmsi = metadata.MMSI;
        const lon = metadata.longitude !== undefined ? metadata.longitude : metadata.Longitude;
        const lat = metadata.latitude !== undefined ? metadata.latitude : metadata.Latitude;
        
        let name = (metadata.ShipName || metadata.shipName || "").trim() || `MMSI ${mmsi}`;
        name = name.replace(/@+$/, '').trim();
        
        const heading = payload.TrueHeading !== undefined ? payload.TrueHeading : (payload.Cog || 0);
        
        const ship = {
          mmsi,
          name,
          imo: metadata.IMO ? String(metadata.IMO) : '',
          type: "Cargo Ship",
          position: [lon, lat],
          headingDeg: heading,
          updatedAt: Date.now()
        };

        if (lon !== undefined && lat !== undefined && Math.abs(lon) <= 180 && Math.abs(lat) <= 90) {
          activeShips.set(mmsi, ship);
        }
      }
    } catch (e) {
      console.error("[onmessage error]:", e.message);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed. Reconnecting in 5 seconds...');
    setTimeout(connect, 5000);
  };

  socket.onerror = (err) => {
    console.error('WebSocket error occurred:', err);
  };
}

connect();
