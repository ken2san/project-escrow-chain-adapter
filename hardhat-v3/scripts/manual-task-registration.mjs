// Experiment: Manual Ignition task registration
import hardhat from 'hardhat';

console.log('=== Manual Task Registration Experiment ===');

async function main() {
  try {
    console.log('\n1. Import Ignition plugin and examine task structure:');

    const ignitionPlugin = await import('@nomicfoundation/hardhat-ignition');
    const plugin = ignitionPlugin.default;

    console.log('Plugin tasks count:', plugin.tasks.length);

    console.log('\n2. Check if HRE has task registration methods:');

    // Look for task registration methods in HRE
    const hreProto = Object.getPrototypeOf(hardhat);
    const hreMethods = [...Object.getOwnPropertyNames(hardhat), ...Object.getOwnPropertyNames(hreProto)];
    const taskMethods = hreMethods.filter(m => m.includes('task') || m.includes('register'));
    console.log('Task-related methods:', taskMethods);

    // Try common Hardhat task registration patterns
    console.log('\n3. Attempt manual task registration:');

    if (typeof hardhat.task === 'function') {
      console.log('Found hardhat.task() method');

      // Try to register the main ignition task
      try {
        hardhat.task('ignition', 'Deploy your smart contracts using Hardhat Ignition')
          .setAction(async () => {
            console.log('Ignition task executed (manual registration)');
          });
        console.log('✅ Successfully registered ignition task manually');
      } catch (e) {
        console.log('❌ Manual registration failed:', e.message);
      }
    } else {
      console.log('No hardhat.task() method found');
    }

    console.log('\n4. Check if tasks were registered:');
    console.log('hardhat.tasks keys after manual registration:', Object.keys(hardhat.tasks));

    console.log('\n5. Try to understand plugin activation:');

    // Check if there's a way to activate/apply the plugin
    if (typeof plugin.apply === 'function') {
      console.log('Plugin has apply() method, trying to call it...');
      try {
        plugin.apply(hardhat);
        console.log('✅ Plugin.apply() succeeded');
        console.log('Tasks after apply:', Object.keys(hardhat.tasks));
      } catch (e) {
        console.log('❌ Plugin.apply() failed:', e.message);
      }
    }

    // Check if there are hook handlers that need to be called
    if (plugin.hookHandlers) {
      console.log('Plugin hookHandlers:', Object.keys(plugin.hookHandlers));

      if (plugin.hookHandlers.config && typeof plugin.hookHandlers.config === 'function') {
        console.log('Trying to call config hook handler...');
        try {
          plugin.hookHandlers.config(hardhat.config);
          console.log('✅ Config hook handler succeeded');
        } catch (e) {
          console.log('❌ Config hook handler failed:', e.message);
        }
      }
    }

    console.log('\n6. Final task registry check:');
    console.log('Final hardhat.tasks keys:', Object.keys(hardhat.tasks));

  } catch (error) {
    console.error('Experiment failed:', error);
  }
}

main().catch(console.error);