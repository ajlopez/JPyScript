
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
    test.equal(compileCommand(test, 'class Foo: pass'), 'var Foo = (function() { function $obj() { } function $cons() { return new $obj(); } return $cons; })();');
}
