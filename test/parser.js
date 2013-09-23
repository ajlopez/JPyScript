
var py2s = require('../');

function parseExpression(test, text) {
    var parser = new py2s.Parser(text);
    var expr = parser.parseExpression();
    test.ok(expr);
    test.equal(parser.parseExpression(), null);
    return expr;
}

exports['Parse integer expression'] = function (test) {
    parseExpression(test, "123");
}

exports['Parse string expression'] = function (test) {
    parseExpression(test, '"spam"');
}
