
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.execute);

// Simple

py2s.execute('a = 1');
assert.equal(py2s.evaluate('a'), 1);

// for in

py2s.execute('total = 0; for item in [1,2,3]: total += item');
assert.equal(py2s.evaluate('total'), 6);
assert.ok(total);
assert.equal(total, 6);
