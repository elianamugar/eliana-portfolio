import { execFileSync } from "node:child_process";
import fs from "node:fs";

const bucket = "r2:eliana-portfolio-photos/photos";
const run = (...args) => execFileSync("rclone", args, {
  encoding: "utf8", maxBuffer: 64 * 1024 * 1024
});
const list = (...args) => run("lsf", ...args).split(/\r?\n/).filter(Boolean);
const image = /\.(jpg|jpeg|png|webp)$/i;
const projects = Object.create(null);
const metadata = Object.create(null);
const covers = Object.create(null);
const folders = list(bucket, "--dirs-only").map(s => s.replace(/\/$/, ""));
const coverFiles = folders.includes("covers") ? list(`${bucket}/covers`, "--files-only") : [];
for (const folder of folders) {
  if (folder === "covers" || folder.startsWith(".")) continue;
  const files = list(`${bucket}/${folder}`, "--files-only");
  const photos = files.filter(f => image.test(f) && !f.startsWith(".")).sort();
  if (!photos.length) continue;
  projects[folder] = photos;
  const cover = coverFiles.find(f => f === `${folder}.jpg`) ||
    coverFiles.find(f => image.test(f) && f.replace(image, "") === folder);
  covers[folder] = cover ? `covers/${encodeURIComponent(cover)}` :
    `${encodeURIComponent(folder)}/${encodeURIComponent(photos[0])}`;
  if (files.includes("metadata.json")) {
    const m = JSON.parse(run("cat", `${bucket}/${folder}/metadata.json`));
    if (!m || typeof m !== "object" || Array.isArray(m)) throw new Error(`Invalid metadata: ${folder}`);
    const clean = {};
    for (const key of ["title", "date", "description"]) {
      if (m[key] === undefined) continue;
      if (typeof m[key] !== "string" || !m[key].trim()) throw new Error(`Invalid ${key}: ${folder}`);
      clean[key] = m[key].trim();
    }
    if (clean.date && !/^\d{4}-(0[1-9]|1[0-2])$/.test(clean.date)) throw new Error(`Invalid date: ${folder}`);
    metadata[folder] = clean;
  }
}
if (!Object.keys(projects).length) throw new Error("No albums found; refusing to replace archive");
fs.mkdirSync("src/data", { recursive: true });
const output = "src/data/photoProjects.js";
const source = Object.entries({photoProjects: projects, albumMetadata: metadata, photoCovers: covers})
  .map(([key, value]) => `export const ${key} = ${JSON.stringify(value, null, 2)};\n`).join("\n");
fs.writeFileSync(`${output}.tmp`, source);
fs.renameSync(`${output}.tmp`, output);
console.log(`Generated ${output}: ${Object.keys(projects).length} albums`);
