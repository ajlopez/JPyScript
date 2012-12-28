
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