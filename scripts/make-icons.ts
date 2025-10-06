// Generate icon PNGs from SVG source
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const sizes = [16, 32, 48, 128] as const;

async function generateIcons(): Promise<void> {
  await mkdir('icons', { recursive: true });

  for (const size of sizes) {
    await sharp('icons/icon.svg')
      .resize(size, size)
      .png()
      .toFile(`icons/icon-${size}.png`);
    console.log(`✔ icons/icon-${size}.png`);
  }
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
