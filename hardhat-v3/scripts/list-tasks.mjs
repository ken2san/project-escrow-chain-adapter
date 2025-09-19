import hre from 'hardhat';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

(async () => {
  console.log('cwd:', process.cwd());
  console.log('HRE loaded:', !!hre);
  try {
    const resolvedHardhat = require.resolve('hardhat');
    console.log('resolved hardhat package:', resolvedHardhat);
    if (hre.tasks) {
      if (Array.isArray(hre.tasks.taskNames)) {
        console.log('hre.tasks.taskNames:', hre.tasks.taskNames);
      }
      else if (typeof hre.tasks.getAll === 'function') {
        const all = hre.tasks.getAll();
        console.log('hre.tasks.getAll() count:', all.length);
        console.log('first 20 task names:', all.slice(0, 20).map(t => t.name));
      }
      else {
        console.log('hre.tasks keys:', Object.keys(hre.tasks));
      }
    } else {
      console.log('hre.tasks is not present');
    }
  } catch (e) {
    console.error('error listing hre.tasks:', e && e.stack ? e.stack : e);
  }

  // Try importing the ignition package main to inspect exported plugin object
  try {
    const ignitionPath = path.resolve('node_modules/@nomicfoundation/hardhat-ignition/dist/src/index.js');
    console.log('trying to import ignition from', ignitionPath);
    const mod = await import(ignitionPath);
    console.log('ignition module keys:', Object.keys(mod));
    console.log('has default:', !!mod.default);
    if (mod.default && mod.default.tasks) {
      console.log('default.tasks length:', mod.default.tasks.length);
      const names = mod.default.tasks.slice(0, 10).map(t => (t && t.name) || '[unknown]');
      console.log('example tasks from plugin:', names);
    }
  } catch (e) {
    console.error('import ignition error:', e && e.stack ? e.stack : e && e.message);
    process.exitCode = 1;
  }
})();
