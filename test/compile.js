
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

// Compile integer expression

assert.equal(compileExpression("123"), "123");

// Parse string expression

assert.equal(compileExpression('"spam"'), '"spam"');
