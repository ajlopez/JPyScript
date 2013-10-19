
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
    test.ok(code.indexOf('var $class = makeClass(__init__);') >= 0);
}

exports['Compile class with init and method'] = function (test) {
    var code = compileCommand(test, 'class Foo:\n  def __init__(self, name):\n    self.name=name\n  def get_name(self):\n     return self.name');
    test.ok(code.indexOf('var Foo = (function() {') == 0);
    test.ok(code.indexOf('return $cons;') >= 0);
    test.ok(code.indexOf('var $class = makeClass(__init__);') >= 0);
    test.ok(code.indexOf('function __init__(self, name)') >= 0);
    test.ok(code.indexOf('function get_name(self)') >= 0);
    test.ok(code.indexOf('self.name = name;') >= 0);
    test.ok(code.indexOf('return self.name;') >= 0);
    test.ok(code.indexOf('$cons.get_name = get_name;') >= 0);
    test.ok(code.indexOf('$obj.prototype.get_name = function () { return get_name(this); }') >= 0);
    test.ok(code.indexOf('function __init__()') < 0);
}
