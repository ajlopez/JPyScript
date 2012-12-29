
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.eval);

assert.equal(py2s.eval('123'), 123);
assert.equal(py2s.eval('"spam"'), "spam");
assert.equal(py2s.eval('len("spam")'), 4);

// Index

assert.equal(py2s.eval('"spam"[0]'), 's');

