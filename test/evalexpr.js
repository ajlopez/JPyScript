
var py2s = require('../'),
    assert = require('assert');

assert.ok(py2s.Parser);

function evaluateExpression(text) {
    var parser = new py2s.Parser(text);
    var expr = parser.parseExpression();
    assert.ok(expr);
    assert.equal(parser.parseExpression(), null);
    return eval(expr.compile());
}

// Evaluate integer

assert.equal(evaluateExpression("123"), 123);

// Evaluate string

assert.equal(evaluateExpression('"spam"'), "spam");

// Evaluate add

assert.equal(evaluateExpression('1+2'), 3);
