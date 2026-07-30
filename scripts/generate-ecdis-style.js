const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fetching OpenFreeMap bright style...');
  const res = await fetch('https://tiles.openfreemap.org/styles/bright');
  const style = await res.json();

  console.log('Modifying style for ECDIS theme...');

  // Modify background (land) color
  const backgroundLayer = style.layers.find(l => l.id === 'background');
  if (backgroundLayer && backgroundLayer.paint) {
    backgroundLayer.paint['background-color'] = '#EED382'; // Marine navigation chart yellow-sand
  }

  // Modify water layer color
  const waterLayer = style.layers.find(l => l.id === 'water');
  if (waterLayer && waterLayer.paint) {
    waterLayer.paint['fill-color'] = '#00B4E5'; // Marine navigation chart bright cyan-blue
  }

  // Modify intermittent water
  const waterIntermittentLayer = style.layers.find(l => l.id === 'water-intermittent');
  if (waterIntermittentLayer && waterIntermittentLayer.paint) {
    waterIntermittentLayer.paint['fill-color'] = '#00B4E5';
    waterIntermittentLayer.paint['fill-opacity'] = 0.6;
  }

  // Modify waterway lines to match
  const waterways = style.layers.filter(l => l.id.startsWith('waterway'));
  for (const layer of waterways) {
    if (layer.paint && layer.paint['line-color']) {
      layer.paint['line-color'] = '#0090B8';
    }
  }

  // Modify parks/woodland/grass layers to vibrant green
  const greenLayers = ['park', 'landcover-wood', 'landcover-grass', 'landcover-grass-park'];
  for (const name of greenLayers) {
    const layer = style.layers.find(l => l.id === name);
    if (layer && layer.paint) {
      layer.paint['fill-color'] = '#2AD957'; // Vibrant neon green
      if (layer.paint['fill-opacity'] !== undefined) {
        layer.paint['fill-opacity'] = 0.85;
      }
    }
  }

  // Ensure public/styles directory exists
  const outputDir = path.join(__dirname, '../public/styles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'ecdis.json');
  fs.writeFileSync(outputPath, JSON.stringify(style, null, 2));
  console.log(`Successfully generated ECDIS style at: ${outputPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
