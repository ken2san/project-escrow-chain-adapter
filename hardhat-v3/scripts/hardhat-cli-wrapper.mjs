#!/usr/bin/env node
// Lightweight wrapper to call Hardhat's internal CLI main without registering tsx.
// This avoids TSX register hooks that can cause package export errors in some setups.
const path = '../node_modules/hardhat/dist/src/internal/cli/main.js';
try {
  const mod = await import(path);
  if (mod && typeof mod.main === 'function') {
    await mod.main(process.argv.slice(2), { registerTsx: false, allowNonlocalHardhatInstallation: true });
    process.exit(process.exitCode ?? 0);
  }
  console.error('Failed to load hardhat internal main from', path);
  process.exit(1);
}
catch (e) {
  console.error('Error running hardhat wrapper:', e);
  process.exit(1);
}
