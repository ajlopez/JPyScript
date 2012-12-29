
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.eval);

// Simple

assert.equal(py2s.eval('123'), 123);
assert.equal(py2s.eval('-123'), -123);
assert.equal(py2s.eval('"spam"'), "spam");

// len

assert.equal(py2s.eval('len("spam")'), 4);

// Index

assert.equal(py2s.eval('"spam"[0]'), 's');
assert.equal(py2s.eval('"spam"[1]'), 'p');
assert.equal(py2s.eval('"spam"[-1]'), 'm');
assert.equal(py2s.eval('"spam"[-2]'), 'a');

// Global

assert.ok(py2s.eval('global'));
assert.equal(py2s.eval('global'), global);