
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

py2s.execute("acum = ''; for letter in 'spam':\n  acum += letter\n  acum += '.'");
assert.equal(py2s.evaluate('acum'), 's.p.a.m.');
assert.ok(acum);
assert.equal(acum, 's.p.a.m.');

// while

py2s.execute('total = 0; while total < 10: total += 1');
assert.equal(py2s.evaluate('total'), 10);
assert.ok(total);
assert.equal(total, 10);
