import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "assets/source/og.svg");
const outputPath = path.join(root, "public/og.png");
const source = await readFile(sourcePath);

await sharp(source, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9, palette: true })
  .toFile(outputPath);

console.log(`Generated ${path.relative(root, outputPath)} from ${path.relative(root, sourcePath)}`);
