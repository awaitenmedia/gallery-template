/* .github/scripts/generate.js
   Node 18+  (repo has "type": "module" in package.json)
   Run: node .github/scripts/generate.js
*/

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sizeOf from 'image-size';
import sharp from 'sharp';

// Resolve paths relative to repo root ---------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot  = path.resolve(__dirname, '../..');
const imagesDir = path.join(repoRoot, 'images');
const template  = path.join(repoRoot, 'template.html');
const output    = path.join(repoRoot, 'index.html');

// Supported image extensions ------------------------------------------------
const exts = /\.(jpe?g|png|webp)$/i;

// Read template -------------------------------------------------------------
const tpl = await fs.readFile(template, 'utf8');

// Scan /images/ -------------------------------------------------------------
const files = (await fs.readdir(imagesDir)).filter(f => exts.test(f)).sort();

// Helper: build thumbnail name ----------------------------------------------
const thumbName = f => 'thumb-' + f.replace(/\.(jpe?g|png)$/i, '.webp');

// Build gallery HTML & thumbnails ------------------------------------------
let galleryHTML = '';

for (const file of files) {
  const absPath = path.join(imagesDir, file);
  const thumb   = thumbName(file);
  const thumbPath = path.join(imagesDir, thumb);

  // Generate thumb only if it doesn't exist
  try {
    await fs.access(thumbPath);
  } catch {
    await sharp(absPath)
      .resize({ width: 800 })
      .webp({ quality: 70 })
      .toFile(thumbPath);
  }

  // Get original dimensions
  const { width, height } = sizeOf(absPath);

  // Build markup
  galleryHTML += `
  <a class="grid-item"
     href="images/${file}"
     data-lg-size="${width}-${height}">
    <img src="images/${thumb}"
         alt=""
         loading="lazy"
         decoding="async"
         width="${width}"
         height="${height}">
  </a>`;
}

// Inject into template ------------------------------------------------------
const finalHTML = tpl.replace('<!--{{gallery}}-->', galleryHTML.trim());

// Write index.html ----------------------------------------------------------
await fs.writeFile(output, finalHTML, 'utf8');

console.log(`✅ Generated index.html with ${files.length} images`);