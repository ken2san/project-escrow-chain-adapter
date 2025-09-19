// Deep dive into Ignition plugin task structure
import fs from 'fs/promises';

console.log('=== Ignition Plugin Internal Structure Analysis ===');

async function main() {
  try {
    console.log('\n1. Read plugin source code directly:');

    // Read the main plugin file
    const pluginPath = 'node_modules/@nomicfoundation/hardhat-ignition/dist/src/index.js';
    const pluginContent = await fs.readFile(pluginPath, 'utf8');

    console.log('Plugin file size:', pluginContent.length);

    // Look for task definitions in the source
    const taskMatches = pluginContent.match(/(task|subtask)\s*\(/g);
    console.log('Task definition patterns found:', taskMatches?.length || 0);

    // Look for 'ignition' string occurrences
    const ignitionMatches = pluginContent.match(/['"`]ignition['"`]/g);
    console.log('Ignition string references:', ignitionMatches?.length || 0);

    // Extract a sample of task definitions
    const taskRegex = /(task|subtask)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;
    const foundTasks = [];
    while ((match = taskRegex.exec(pluginContent)) !== null && foundTasks.length < 10) {
      foundTasks.push(match[2]);
    }
    console.log('Task names found in source:', foundTasks);

    console.log('\n2. Check plugin export structure:');

    const ignitionPlugin = await import('@nomicfoundation/hardhat-ignition');
    const plugin = ignitionPlugin.default;

    // Try to understand how tasks are built
    console.log('Plugin object structure:');
    Object.keys(plugin).forEach(key => {
      const value = plugin[key];
      console.log(`- ${key}:`, typeof value, Array.isArray(value) ? `(array of ${value.length})` : '');

      if (key === 'tasks' && Array.isArray(value)) {
        // Deep dive into task structure
        console.log('\n  Task array analysis:');
        value.forEach((task, i) => {
          console.log(`  Task ${i} full object:`, JSON.stringify(task, null, 2));
          if (i >= 2) return; // Limit output
        });
      }
    });

    console.log('\n3. Check if tasks have internal name properties:');

    plugin.tasks.forEach((task, i) => {
      console.log(`\nTask ${i} detailed inspection:`);
      console.log('Object keys:', Object.keys(task));
      console.log('Object values:', Object.values(task).map(v => typeof v));

      // Look for any property that might contain the task name
      Object.entries(task).forEach(([key, value]) => {
        if (typeof value === 'string' && value.includes('ignition')) {
          console.log(`  Found 'ignition' in ${key}:`, value);
        }
      });
    });

    console.log('\n4. Check if it is a function that needs to be called:');

    // Maybe tasks need to be activated somehow
    if (typeof plugin.tasks === 'function') {
      console.log('plugin.tasks is a function, trying to call it...');
      try {
        const activatedTasks = plugin.tasks();
        console.log('Activated tasks:', activatedTasks);
      } catch (e) {
        console.log('Failed to call plugin.tasks():', e.message);
      }
    }

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

main().catch(console.error);