
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.Parser);

function compileCommand(text) {
    var parser = new py2s.Parser(text);
    var cmd = parser.parseCommand();
    assert.ok(cmd);
    assert.equal(parser.parseCommand(), null);
    return cmd.compile();
}

// Run simple assignements

eval(compileCommand('a=1'));
assert.equal(a, 1);
eval(compileCommand('b=1+2'));
assert.equal(b, 3);
eval(compileCommand('b=1+2-3'));
assert.equal(b, 0);
eval(compileCommand('b=1+2*3'));
assert.equal(b, 7);
eval(compileCommand('b=1*2+3'));
assert.equal(b, 5);
eval(compileCommand('b=2*3+4'));
assert.equal(b, 10);
eval(compileCommand('b=2*(3+4)'));
assert.equal(b, 14);

// Run composite commands

eval(compileCommand('a=1; b = 2'));
assert.equal(a, 1);
assert.equal(b, 2);
eval(compileCommand('a=3\nb = 4'));
assert.equal(a, 3);
assert.equal(b, 4);

// Run simple if

eval(compileCommand('a=1; if a<2: a=a+1'));
assert.equal(a, 2);

// Run simple while

eval(compileCommand('a=1; while a < 10: a=a+1'));
assert.equal(a, 10);

// Run simple factorial

eval(compileCommand('a=1; n=1; while n < 5:\n  a=a*n\n  n=n+1'));
assert.equal(n, 5);
assert.equal(a, 24);

// Run get index

eval(compileCommand('a=1; n=1; while n < 5:\n  a=a*n\n  n=n+1'));
assert.equal(n, 5);
assert.equal(a, 24);

// Run set property

var person = {};
eval(compileCommand('person.name = "Adam"'));
assert.ok(person.name);
assert.equal(person.name, "Adam");

