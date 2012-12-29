
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.execute);

// Simple

py2s.execute('a = 1');
assert.equal(py2s.eval('a'), 1);

// for in

py2s.execute('total = 0; for item in [1,2,3]: total += item');
assert.equal(py2s.eval('total'), 6);
