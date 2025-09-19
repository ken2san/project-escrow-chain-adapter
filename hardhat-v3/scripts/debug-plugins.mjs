// Deep inspection of Hardhat plugin loading for Ignition
import hardhat from 'hardhat';
import fs from 'fs/promises';

console.log('=== Hardhat Plugin Investigation ===');

async function main() {
  try {
    console.log('\n1. Hardhat object inspection:');
    console.log('hardhat keys:', Object.keys(hardhat));
    console.log('hardhat.config exists:', !!hardhat.config);
    console.log('hardhat.tasks exists:', !!hardhat.tasks);

    if (hardhat.tasks) {
      console.log('hardhat.tasks keys:', Object.keys(hardhat.tasks));
      const taskNames = Object.keys(hardhat.tasks);
      console.log('Available tasks:', taskNames);

      // Look for ignition-related tasks
      const ignitionTasks = taskNames.filter(name => name.includes('ignition'));
      console.log('Ignition tasks found:', ignitionTasks);
    }

    console.log('\n2. Plugin import verification:');

    // Try to import the ignition plugin directly
    try {
      const ignitionPlugin = await import('@nomicfoundation/hardhat-ignition');
      console.log('Direct ignition import successful');
      console.log('ignition plugin keys:', Object.keys(ignitionPlugin));
      console.log('ignition default export:', !!ignitionPlugin.default);

      if (ignitionPlugin.default) {
        const defaultExport = ignitionPlugin.default;
        console.log('default export keys:', Object.keys(defaultExport));
        console.log('default.tasks exists:', !!defaultExport.tasks);
        if (defaultExport.tasks) {
          console.log('default.tasks length:', defaultExport.tasks.length);
          // Show first few task names
          defaultExport.tasks.slice(0, 3).forEach((task, i) => {
            console.log(`Task ${i}:`, task.name || 'unnamed');
          });
        }
      }
    } catch (e) {
      console.error('Direct ignition import failed:', e.message);
    }

    console.log('\n3. Hardhat config analysis:');
    if (hardhat.config) {
      console.log('Config paths:', hardhat.config.paths);
      console.log('Config networks:', Object.keys(hardhat.config.networks || {}));
      console.log('Config mocha:', !!hardhat.config.mocha);
    }

    console.log('\n4. Package.json analysis:');
    try {
      const pkgJson = await fs.readFile('package.json', 'utf8');
      const pkg = JSON.parse(pkgJson);
      console.log('Project type:', pkg.type);
      console.log('Hardhat ignition version:', pkg.devDependencies?.['@nomicfoundation/hardhat-ignition']);
      console.log('Hardhat version:', pkg.devDependencies?.['hardhat']);
      console.log('All hardhat deps:', Object.keys(pkg.devDependencies || {}).filter(k => k.includes('hardhat')));
    } catch (e) {
      console.error('Package.json read failed:', e.message);
    }

    console.log('\n5. Check if hardhat.config.ts imports are executed at runtime:');
    // This should show our debug messages from hardhat.config.ts

    console.log('\n6. Environment check:');
    console.log('Node version:', process.version);
    console.log('Working directory:', process.cwd());
    console.log('Hardhat config file exists:', await fs.access('hardhat.config.ts').then(() => true).catch(() => false));

  } catch (error) {
    console.error('Investigation failed:', error);
  }
}

main().catch(console.error);