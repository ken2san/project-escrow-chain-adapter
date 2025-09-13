const assert = require('assert');

describe('CommonJS smoke test', function () {
  it('should run under CommonJS', function () {
    assert.strictEqual(2 + 2, 4);
  });
});
