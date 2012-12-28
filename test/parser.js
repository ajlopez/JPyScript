
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.Parser);

function parseExpression(text) {
    var parser = new py2s.Parser(text);
    var expr = parser.parseExpression();
    assert.ok(expr);
    assert.equal(parser.parseExpression(), null);
    return expr;
}

// Parse integer expression

parseExpression("123");

// Parse string expression

parseExpression('"spam"');
