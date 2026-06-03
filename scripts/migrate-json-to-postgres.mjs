import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "../prisma/seed.js");

const child = spawn(process.execPath, [seedPath], {
  stdio: "inherit",
  env: process.env,
});

await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("exit", (code) => {
    if (code === 0) {
      resolve(undefined);
      return;
    }

    reject(new Error(`Seed script exited with code ${code}`));
  });
});