import fs from "node:fs";
import path from "node:path";

const copyRecursive = (source, destination) => {
  if (!fs.existsSync(source)) throw new Error(`Missing ${source}`);
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(from, to);
      continue;
    }
    fs.copyFileSync(from, to);
  }
};

const root = process.cwd();
const exampleDir = path.join(root, "src", "user.example");
const userDir = path.join(root, "src", "user");

if (fs.existsSync(userDir) && fs.readdirSync(userDir).length > 0) {
  // eslint-disable-next-line no-console
  console.log("src/user already exists; no changes made.");
  process.exit(0);
}

copyRecursive(exampleDir, userDir);
// eslint-disable-next-line no-console
console.log("Initialized src/user from src/user.example.");

