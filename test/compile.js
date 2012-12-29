
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

assert.equal(compileExpression('"spam"'), "'spam'");

// Compile variable expression

assert.equal(compileExpression('spam'), 'spam');

// Compile add expression

assert.equal(compileExpression('1+2'), '1 + 2');

// Compile expression command

assert.equal(compileCommand('"spam"'), "'spam';");
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

// Compile list as array

assert.equal(compileExpression('[]'), '[]');
assert.equal(compileExpression('[1,2,3]'), '[1, 2, 3]');
assert.equal(compileExpression('[a,b,[1,2]]'), '[a, b, [1, 2]]');

// Compile dotted name

assert.equal(compileExpression('a.b'), 'a.b');

// Compile dictionary as object

assert.equal(compileExpression('{}'), '{}');
assert.equal(compileExpression("{'name': 'Adam', 'age': 800}"), "{'name': 'Adam', 'age': 800}");

// Compile extended assignments

assert.equal(compileCommand('a+=1'), 'a += 1;');
assert.equal(compileCommand('a-=1'), 'a -= 1;');
assert.equal(compileCommand('a*=1'), 'a *= 1;');
assert.equal(compileCommand('a/=1'), 'a /= 1;');

// Compile for in

assert.equal(compileCommand('for a in b: print(a)'), 'forEach(b, function(a) { print(a); })');
assert.equal(compileCommand('for item in [1,2,3]: total += item'), 'forEach([1, 2, 3], function(item) { total += item; })');

// Compile composite with indent

assert.equal(compileCommand('\
n = 1\n\
total = 1\n\
while n <= 10:\n\
  total *= n\n\
  n += 1\n\
print(total)'), 'n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

assert.equal(compileCommand('\
n = 1\n\
total = 1\n\
\n\
while n <= 10:\n\
  total *= n\n\
  n += 1\n\
print(total)'), 'n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

assert.equal(compileCommand('\
n = 1\n\
total = 1\n\
\n\
while n <= 10:\n\
  total *= n\n\
  n += 1\n\
\n\
print(total)'), 'n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');
