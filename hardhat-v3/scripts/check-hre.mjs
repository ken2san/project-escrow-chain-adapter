import hre from 'hardhat';

(async () => {
  console.log('HRE loaded:', !!hre);
  console.log('hre.runtimeEnvironment keys:', Object.keys(hre).sort());
  try {
    console.log('hre.config.mocha:', hre.config.mocha);
  } catch (e) {
    console.log('could not read hre.config.mocha:', e && e.message);
  }
})();
