
var jpyparser = require('../lib/jpyparser');

function compileCommand(test, text) {
    var parser = jpyparser.createParser(text);
    var cmd = parser.parseCommand();
    test.ok(cmd);
    test.equal(parser.parseCommand(), null);
    var code = cmd.compile(true);
    return code;
}

exports['Compile empty class'] = function (test) {
    var code = compileCommand(test, 'class Foo: pass');
    test.ok(code.indexOf('var Foo = (function() {') == 0);
    test.ok(code.indexOf('return $cons;') >= 0);
    test.ok(code.indexOf('makeClass(__init__);') >= 0);
}
