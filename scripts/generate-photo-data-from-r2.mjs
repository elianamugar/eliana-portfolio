import { execSync } from "node:child_process";
import fs from "node:fs";

const bucket = "r2:eliana-portfolio-photos/photos";

const folders = execSync(
  `rclone lsf ${bucket} --dirs-only`,
  { encoding: "utf8" }
)
  .split("\n")
  .filter(Boolean)
  .map((folder) => folder.replace("/", ""));

const projects = {};

for (const folder of folders) {
  if (folder === "covers") continue;

  const files = execSync(
    `rclone lsf ${bucket}/${folder}`,
    { encoding: "utf8" }
  )
    .split("\n")
    .filter((file) =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

  projects[folder] = files;
}

fs.mkdirSync("src/data", { recursive: true });

fs.writeFileSync(
  "src/data/photoProjects.js",
  `export const photoProjects = ${JSON.stringify(
    projects,
    null,
    2
  )};\n`
);

console.log("Generated src/data/photoProjects.js");