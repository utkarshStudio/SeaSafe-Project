const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fetching OpenFreeMap bright style...');
  const res = await fetch('https://tiles.openfreemap.org/styles/bright');
  const baseStyle = await res.json();

  const outputDir = path.join(__dirname, '../public/styles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Generate ECDIS Chart (Nautical yellow/blue/green)
  const ecdisStyle = JSON.parse(JSON.stringify(baseStyle));
  const ecdisBg = ecdisStyle.layers.find(l => l.id === 'background');
  if (ecdisBg && ecdisBg.paint) ecdisBg.paint['background-color'] = '#EED382';
  const ecdisWater = ecdisStyle.layers.find(l => l.id === 'water');
  if (ecdisWater && ecdisWater.paint) ecdisWater.paint['fill-color'] = '#00B4E5';
  const ecdisIntermittent = ecdisStyle.layers.find(l => l.id === 'water-intermittent');
  if (ecdisIntermittent && ecdisIntermittent.paint) {
    ecdisIntermittent.paint['fill-color'] = '#00B4E5';
    ecdisIntermittent.paint['fill-opacity'] = 0.6;
  }
  ecdisStyle.layers.filter(l => l.id.startsWith('waterway')).forEach(l => {
    if (l.paint && l.paint['line-color']) l.paint['line-color'] = '#0090B8';
  });
  ['park', 'landcover-wood', 'landcover-grass', 'landcover-grass-park'].forEach(name => {
    const layer = ecdisStyle.layers.find(l => l.id === name);
    if (layer && layer.paint) {
      layer.paint['fill-color'] = '#2AD957';
      if (layer.paint['fill-opacity'] !== undefined) layer.paint['fill-opacity'] = 0.85;
    }
  });
  fs.writeFileSync(path.join(outputDir, 'ecdis.json'), JSON.stringify(ecdisStyle, null, 2));
  console.log('Successfully generated ECDIS style.');

  // 2. Generate Green Land & Blue Water style
  const greenBlueStyle = JSON.parse(JSON.stringify(baseStyle));
  const gbBg = greenBlueStyle.layers.find(l => l.id === 'background');
  if (gbBg && gbBg.paint) gbBg.paint['background-color'] = '#8CD08C'; // Lush green land background
  const gbWater = greenBlueStyle.layers.find(l => l.id === 'water');
  if (gbWater && gbWater.paint) gbWater.paint['fill-color'] = '#2B72E5'; // Clear ocean blue
  const gbIntermittent = greenBlueStyle.layers.find(l => l.id === 'water-intermittent');
  if (gbIntermittent && gbIntermittent.paint) {
    gbIntermittent.paint['fill-color'] = '#2B72E5';
    gbIntermittent.paint['fill-opacity'] = 0.6;
  }
  greenBlueStyle.layers.filter(l => l.id.startsWith('waterway')).forEach(l => {
    if (l.paint && l.paint['line-color']) l.paint['line-color'] = '#1D53B2';
  });
  ['park', 'landcover-wood', 'landcover-grass', 'landcover-grass-park'].forEach(name => {
    const layer = greenBlueStyle.layers.find(l => l.id === name);
    if (layer && layer.paint) {
      layer.paint['fill-color'] = '#6DBA6D'; // Contrasting forest green
    }
  });
  fs.writeFileSync(path.join(outputDir, 'green-blue.json'), JSON.stringify(greenBlueStyle, null, 2));
  console.log('Successfully generated Green Land & Blue Water style.');

  // 3. Generate Satellite style
  const satelliteStyle = {
    version: 8,
    sources: {
      satellite: {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Esri, USGS, NOAA'
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite',
        minzoom: 0,
        maxzoom: 20
      }
    ]
  };
  fs.writeFileSync(path.join(outputDir, 'satellite.json'), JSON.stringify(satelliteStyle, null, 2));
  console.log('Successfully generated Satellite style.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
