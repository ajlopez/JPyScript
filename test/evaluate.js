
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.evaluate);

// Simple

assert.equal(py2s.evaluate('123'), 123);
assert.equal(py2s.evaluate('-123'), -123);
assert.equal(py2s.evaluate('"spam"'), "spam");

// len

assert.equal(py2s.evaluate('len("spam")'), 4);

// Index

assert.equal(py2s.evaluate('"spam"[0]'), 's');
assert.equal(py2s.evaluate('"spam"[1]'), 'p');
assert.equal(py2s.evaluate('"spam"[-1]'), 'm');
assert.equal(py2s.evaluate('"spam"[-2]'), 'a');

// Global

assert.ok(py2s.evaluate('global'));
assert.equal(py2s.evaluate('global'), global);