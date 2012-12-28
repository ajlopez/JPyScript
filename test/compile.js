
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.Parser);

function compileExpression(text) {
    var parser = new py2s.Parser(text);
    var expr = parser.parseExpression();
    assert.ok(expr);
    assert.equal(parser.parseExpression(), null);
    return expr.compile();
}

function compileCommand(text) {
    var parser = new py2s.Parser(text);
    var cmd = parser.parseCommand();
    assert.ok(cmd);
    assert.equal(parser.parseCommand(), null);
    return cmd.compile();
}

// Compile integer expression

assert.equal(compileExpression("123"), "123");

// Parse string expression

assert.equal(compileExpression('"spam"'), '"spam"');

// Parse add expression

assert.equal(compileExpression('1+2'), '1 + 2');

// Parse expression command

assert.equal(compileCommand('"spam"'), '"spam";');
assert.equal(compileCommand('123'), '123;');
assert.equal(compileCommand('1+2'), '1 + 2;');

// Parse assign command

assert.equal(compileCommand('a=1'), 'a = 1;');

