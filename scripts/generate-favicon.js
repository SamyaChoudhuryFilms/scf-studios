import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const srcPath = path.join(__dirname, 'public/logo-square.jpg');
const destPath = path.join(__dirname, 'public/favicon.svg');

try {
  const base64Image = fs.readFileSync(srcPath, 'base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <clipPath id="clip">
    <rect width="100" height="100" rx="20" ry="20" />
  </clipPath>
  <image href="data:image/jpeg;base64,${base64Image}" width="100" height="100" clip-path="url(#clip)" />
</svg>`;

  fs.writeFileSync(destPath, svgContent, 'utf8');
  console.log('Successfully generated rounded favicon.svg!');
} catch (error) {
  console.error('Error generating favicon.svg:', error);
}
