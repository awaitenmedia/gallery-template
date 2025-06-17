// Node 18+
import fs from 'fs/promises';
import path from 'path';
import sizeOf from 'image-size';

const tpl = await fs.readFile('template.html', 'utf8');
const files = (await fs.readdir('images')).filter(f => /\.(jpe?g|png|webp)$/i.test(f));

let html = '';
for (const f of files) {
  const { width, height } = sizeOf(path.join('images', f));
  html += `
  <a class="grid-item" href="images/${f}" data-lg-size="${width}-${height}">
    <img src="images/${f}" alt="" loading="lazy">
  </a>`;
}

await fs.writeFile('index.html', tpl.replace('<!--{{gallery}}-->', html));