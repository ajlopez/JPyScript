
var py2s = require('../');

function compileCommand(test, text) {
    var parser = new py2s.Parser(text);
    var cmd = parser.parseCommand();
    test.ok(cmd);
    test.equal(parser.parseCommand(), null);
    return cmd.compile();
}

exports['Run simple assignements'] = function (test) {
eval(compileCommand(test, 'a=1'));
test.equal(a, 1);
eval(compileCommand(test, 'b=1+2'));
test.equal(b, 3);
eval(compileCommand(test, 'b=1+2-3'));
test.equal(b, 0);
eval(compileCommand(test, 'b=1+2*3'));
test.equal(b, 7);
eval(compileCommand(test, 'b=1*2+3'));
test.equal(b, 5);
eval(compileCommand(test, 'b=2*3+4'));
test.equal(b, 10);
eval(compileCommand(test, 'b=2*(3+4)'));
test.equal(b, 14);
}

exports['Run composite commands'] = function (test) {
eval(compileCommand(test, 'a=1; b = 2'));
test.equal(a, 1);
test.equal(b, 2);
eval(compileCommand(test, 'a=3\nb = 4'));
test.equal(a, 3);
test.equal(b, 4);
}

exports['Run simple if'] = function (test) {
eval(compileCommand(test, 'a=1; if a<2: a=a+1'));
test.equal(a, 2);
}

exports['Run simple while'] = function (test) {
eval(compileCommand(test, 'a=1; while a < 10: a=a+1'));
test.equal(a, 10);
}

exports['Run simple factorial'] = function (test) {
eval(compileCommand(test, 'a=1; n=1; while n < 5:\n  a=a*n\n  n=n+1'));
test.equal(n, 5);
test.equal(a, 24);
}

exports['Run get index'] = function (test) {
eval(compileCommand(test, 'a=1; n=1; while n < 5:\n  a=a*n\n  n=n+1'));
test.equal(n, 5);
test.equal(a, 24);
}

exports['Run set property'] = function (test) {
var person = {};
eval(compileCommand(test, 'person.name = "Adam"'));
test.ok(person.name);
test.equal(person.name, "Adam");
}
