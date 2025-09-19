// Investigation: Plugin registration mechanism
import hardhat from 'hardhat';

console.log('=== Plugin Registration Investigation ===');

async function main() {
  console.log('\n1. Check HRE context and plugin management:');

  // Check if there's a plugin manager
  console.log('hardhat.pluginManager exists:', !!hardhat.pluginManager);
  console.log('hardhat._pluginManager exists:', !!hardhat._pluginManager);

  // Check for registry-related properties
  const hreKeys = Object.getOwnPropertyNames(hardhat);
  console.log('All HRE property names:', hreKeys);

  // Look for any registration-related methods
  const regMethods = hreKeys.filter(k => k.includes('register') || k.includes('plugin') || k.includes('task'));
  console.log('Registration-related methods:', regMethods);

  console.log('\n2. Try to manually trigger plugin loading:');

  try {
    // Import the plugin and try to understand its structure
    const ignitionPlugin = await import('@nomicfoundation/hardhat-ignition');
    const plugin = ignitionPlugin.default;

    console.log('Plugin structure:');
    console.log('- id:', plugin.id);
    console.log('- npmPackage:', plugin.npmPackage);
    console.log('- dependencies:', plugin.dependencies);
    console.log('- hookHandlers keys:', Object.keys(plugin.hookHandlers || {}));

    // Examine task details
    console.log('\n3. Task details:');
    plugin.tasks.forEach((task, i) => {
      console.log(`Task ${i}:`, {
        name: task.name,
        description: task.description,
        action: typeof task.action,
        isSubtask: task.isSubtask,
        paramDefinitions: Object.keys(task.paramDefinitions || {})
      });
    });

    console.log('\n4. Check if tasks have proper structure:');
    const ignitionMainTask = plugin.tasks.find(t => t.name === 'ignition');
    if (ignitionMainTask) {
      console.log('Found main ignition task:', {
        name: ignitionMainTask.name,
        description: ignitionMainTask.description,
        hasAction: !!ignitionMainTask.action
      });
    } else {
      console.log('No main ignition task found');
      console.log('Available task names:', plugin.tasks.map(t => t.name));
    }

  } catch (error) {
    console.error('Plugin examination failed:', error);
  }

  console.log('\n5. Check Hardhat version compatibility:');

  try {
    const hardhatPkg = await import('hardhat/package.json', { assert: { type: 'json' } });
    console.log('Hardhat version:', hardhatPkg.default.version);
  } catch (e) {
    console.log('Could not read Hardhat version from package.json');
  }

  console.log('\n6. Check if there are any async initialization issues:');

  // Wait a bit and check again
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('After delay - tasks count:', Object.keys(hardhat.tasks).length);
}

main().catch(console.error);