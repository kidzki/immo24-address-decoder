import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const sizes = [16, 32, 48, 128];
await mkdir("icons", { recursive: true });

for (const size of sizes) {
  await sharp("icons/icon.svg")
    .resize(size, size)
    .png()
    .toFile(`icons/icon-${size}.png`);
  console.log(`✔ icons/icon-${size}.png`);
}