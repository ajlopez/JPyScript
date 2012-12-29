
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

function compileCommand(text) {
    var parser = new py2s.Parser(text);
    var cmd = parser.parseCommand();
    assert.ok(cmd);
    assert.equal(parser.parseCommand(), null);
    return cmd.compile();
}

// Compile integer expression

assert.equal(compileExpression("123"), "123");

// Compile string expression

assert.equal(compileExpression('"spam"'), '"spam"');

// Compile variable expression

assert.equal(compileExpression('spam'), 'spam');

// Compile add expression

assert.equal(compileExpression('1+2'), '1 + 2');

// Compile expression command

assert.equal(compileCommand('"spam"'), '"spam";');
assert.equal(compileCommand('123'), '123;');
assert.equal(compileCommand('1+2'), '1 + 2;');

// Compile assign command

assert.equal(compileCommand('a=1'), 'a = 1;');

// Compile call expressions

assert.equal(compileExpression('print()'), 'print()');
assert.equal(compileExpression('print(1)'), 'print(1)');

// Compile call command

assert.equal(compileCommand('print()'), 'print();');
assert.equal(compileCommand('print(1)'), 'print(1);');

// Compile composite command

assert.equal(compileCommand('print(1);print (2)'), 'print(1); print(2);');
assert.equal(compileCommand('print(1)\nprint (2)'), 'print(1); print(2);');

// Compile if with single command

assert.equal(compileCommand('if a > 1: print(1)'), 'if (a > 1) { print(1); }');

// Compile if with two commands

assert.equal(compileCommand('if a > 1: print(1);print(2)'), 'if (a > 1) { print(1); print(2); }');

// Compile if with single indented command

assert.equal(compileCommand('if a > 1:\n  print(1)'), 'if (a > 1) { print(1); }');

// Compile while with single command

assert.equal(compileCommand('while a < 10: a=a+1'), 'while (a < 10) { a = a + 1; }');

// Compile while with indented commands

assert.equal(compileCommand('while a < 10:\n  a=a+1\n  a=a*2'), 'while (a < 10) { a = a + 1; a = a * 2; }');

// Compile while with internal if

assert.equal(compileCommand('\
while a < 10:\n\
  a=a+1\n\
  if a == 2:\n\
    print(a)\n\
'), 'while (a < 10) { a = a + 1; if (a == 2) { print(a); } }');

// Compile index access

assert.equal(compileExpression('a[1]'), 'getIndex(a, 1)');
