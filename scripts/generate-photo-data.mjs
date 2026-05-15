import fs from "node:fs";
import path from "node:path";

const photosDir = "src/assets/photos";
const outputFile = "src/data/photoProjects.js";

const projects = {};

for (const folder of fs.readdirSync(photosDir)) {
  const folderPath = path.join(photosDir, folder);

  if (!fs.statSync(folderPath).isDirectory()) continue;

  projects[folder] = fs
    .readdirSync(folderPath)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort();
}

fs.mkdirSync("src/data", { recursive: true });

fs.writeFileSync(
  outputFile,
  `export const photoProjects = ${JSON.stringify(projects, null, 2)};\n`
);

console.log(`Generated ${outputFile}`);