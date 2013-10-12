
var jpyparser = require('../lib/jpyparser.js');

function parseExpression(test, text) {
    var parser = jpyparser.createParser(text);
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
