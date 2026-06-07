#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGET_FOLDER_NAME = 'blsquiEsports';

const sourceFolder = path.join(__dirname, 'frontend');
const userDestination = path.join(process.cwd(), TARGET_FOLDER_NAME);

console.log("⚡ [Blsqui] Injecting Svelte + Vite + Tailwind architecture...");

try {
  fs.ensureDirSync(userDestination);
  fs.copySync(sourceFolder, userDestination);
  console.log("📦 Project files generated successfully.");

  console.log("🚚 Fetching dependencies... Please wait.");
  execSync('npm install', { stdio: 'inherit', cwd: userDestination });

  console.log("✈️ Launching local engine workspace...");
  execSync('npm run dev', { stdio: 'inherit', cwd: userDestination });

} catch (error) {
  console.error("❌ Initialization execution crashed:", error);
}