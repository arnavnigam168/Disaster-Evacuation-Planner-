const fs = require('fs');
const path = require('path');

const frontendRoot = path.resolve(__dirname, '..');
const srcDir = path.join(frontendRoot, 'node_modules', 'leaflet', 'dist', 'images');
const destDir = path.join(frontendRoot, 'public', 'leaflet-images');

if (!fs.existsSync(srcDir)) {
  console.error('Source Leaflet images not found at', srcDir);
  process.exit(1);
}

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png') || f.endsWith('.svg'));
files.forEach(f => {
  const src = path.join(srcDir, f);
  const dst = path.join(destDir, f);
  fs.copyFileSync(src, dst);
  console.log('Copied', f);
});

console.log('Leaflet images copied to', destDir);
