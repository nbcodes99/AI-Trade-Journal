import sharp from "sharp";
import fs from "fs";

const SRC = "./public/glint1.png";
const OUT = "./public/icons";

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

const maskableSizes = [
  { name: "icon-maskable-192.png", size: 192 },
  { name: "icon-maskable-512.png", size: 512 },
];

const run = async () => {
  for (const { name, size } of sizes) {
    await sharp(SRC).resize(size, size).png().toFile(`${OUT}/${name}`);
    console.log(`✓ ${name}`);
  }

  for (const { name, size } of maskableSizes) {
    const padding = Math.round(size * 0.1);
    await sharp(SRC)
      .resize(size - padding * 2, size - padding * 2)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 10, g: 10, b: 10, alpha: 1 },
      })
      .png()
      .toFile(`${OUT}/${name}`);
    console.log(`✓ ${name}`);
  }
};

run();
