
var jpyparser = require('../lib/jpyparser');

function compileCommand(test, text) {
    var parser = jpyparser.createParser(text);
    var cmd = parser.parseCommand();
    test.ok(cmd);
    test.equal(parser.parseCommand(), null);
    var code = cmd.compile({ withvars: true, exports: true });
    return code;
}

exports['Compile variable'] = function (test) {
    test.equal(compileCommand(test, "a = 1"), "var a; a = 1; return { a: a };");
}

