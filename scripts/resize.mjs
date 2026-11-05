import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const roots = [
  ['public/media/sectors', 1800],
  ['public/media/projects', 1200],
  ['public/media/csr', 1200],
  ['public/media/news', 1200],
];
for (const [dir, width] of roots) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    const src = path.join(dir, f);
    const dest = path.join(dir, f.replace(/\.(jpe?g|png)$/i, '.webp'));
    if (fs.existsSync(dest)) continue;
    await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
    fs.unlinkSync(src);
    console.log(dest, (fs.statSync(dest).size / 1024).toFixed(0) + 'KB');
  }
}
