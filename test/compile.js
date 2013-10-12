
var jpyparser = require('../lib/jpyparser');

function compileExpression(test, text) {
    var parser = jpyparser.createParser(text);
    var expr = parser.parseExpression();
    test.ok(expr);
    test.equal(parser.parseExpression(), null);
    return expr.compile();
}

function compileCommand(test, text) {
    var parser = jpyparser.createParser(text);
    var cmd = parser.parseCommand();
    test.ok(cmd);
    test.equal(parser.parseCommand(), null);
    var code = cmd.compile(true);
    return code;
}

exports['Compile integer expression'] = function (test) {
    test.equal(compileExpression(test, "123"), "123");
}

exports['Compile negative integer expression'] = function (test) {
    test.equal(compileExpression(test, "-123"), "-123");
}

exports['Compile negative real expression'] = function (test) {
    test.equal(compileExpression(test, "-123.45"), "-123.45");
}

exports['Compile string expression'] = function (test) {
    test.equal(compileExpression(test, '"spam"'), "'spam'");
}

exports['Compile variable expression'] = function (test) {
    test.equal(compileExpression(test, 'spam'), 'spam');
}

exports['Compile add expression'] = function (test) {
    test.equal(compileExpression(test, '1+2'), '1 + 2');
}

exports['Compile expression command'] = function (test) {
    test.equal(compileCommand(test, '"spam"'), "'spam';");
    test.equal(compileCommand(test, '123'), '123;');
    test.equal(compileCommand(test, '1+2'), '1 + 2;');
}

exports['Compile assign command'] = function (test) {
    test.equal(compileCommand(test, 'a=1'), 'var a; a = 1;');
}

exports['Compile call expressions'] = function (test) {
    test.equal(compileExpression(test, 'print()'), 'print()');
    test.equal(compileExpression(test, 'print(1)'), 'print(1)');
}

exports['Compile call command'] = function (test) {
    test.equal(compileCommand(test, 'print()'), 'print();');
    test.equal(compileCommand(test, 'print(1)'), 'print(1);');
}

exports['Compile composite command'] = function (test) {
    test.equal(compileCommand(test, 'print(1);print (2)'), 'print(1); print(2);');
    test.equal(compileCommand(test, 'print(1)\nprint (2)'), 'print(1); print(2);');
}

exports['Compile if with single command'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1: print(1)'), 'if (a > 1) { print(1); }');
}

exports['Compile if with two commands'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1: print(1);print(2)'), 'if (a > 1) { print(1); print(2); }');
}

exports['Compile if with single indented command'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1:\n  print(1)'), 'if (a > 1) { print(1); }');    
}

exports['Compile if with two single indented command'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1:\n  print(1)\n  print(2)'), 'if (a > 1) { print(1); print(2); }');
}

exports['Compile if with else'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1:\n  print(1)\nelse:  print(2)'), 'if (a > 1) { print(1); } else { print(2); }');
}

exports['Compile if with else with indent'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1:\n  print(1)\nelse:\n  print(2)'), 'if (a > 1) { print(1); } else { print(2); }');
}

exports['Compile while with single command'] = function (test) {
    test.equal(compileCommand(test, 'while a < 10: a=a+1'), 'var a; while (a < 10) { a = a + 1; }');
}

exports['Compile while with indented commands'] = function (test) {
    test.equal(compileCommand(test, 'while a < 10:\n  a=a+1\n  a=a*2'), 'var a; while (a < 10) { a = a + 1; a = a * 2; }');
}

exports['Compile while with internal if'] = function (test) {
    test.equal(compileCommand(test, '\
    while a < 10:\n\
      a=a+1\n\
      if a == 2:\n\
        print(a)\n\
    '), 'var a; while (a < 10) { a = a + 1; if (a == 2) { print(a); } }');
    }

    exports['Compile while with break'] = function (test) {
    test.equal(compileCommand(test, 'while a < 10:\n  break'), 'while (a < 10) { break; }');
}

exports['Compile while with continue'] = function (test) {
    test.equal(compileCommand(test, 'while a < 10:\n  continue'), 'while (a < 10) { continue; }');
}

exports['Compile index access'] = function (test) {
    test.equal(compileExpression(test, 'a[1]'), 'getIndex(a, 1)');
}

exports['Compile list as array'] = function (test) {
    test.equal(compileExpression(test, '[]'), '[]');
    test.equal(compileExpression(test, '[1,2,3]'), '[1, 2, 3]');
    test.equal(compileExpression(test, '[a,b,[1,2]]'), '[a, b, [1, 2]]');
}

exports['Compile dotted name'] = function (test) {
    test.equal(compileExpression(test, 'a.b'), 'a.b');
}

exports['Compile dictionary as object'] = function (test) {
    test.equal(compileExpression(test, '{}'), '{}');
    test.equal(compileExpression(test, "{'name': 'Adam', 'age': 800}"), "{'name': 'Adam', 'age': 800}");
}

exports['Compile extended assignments'] = function (test) {
    test.equal(compileCommand(test, 'a+=1'), 'var a; a += 1;');
    test.equal(compileCommand(test, 'a-=1'), 'var a; a -= 1;');
    test.equal(compileCommand(test, 'a*=1'), 'var a; a *= 1;');
    test.equal(compileCommand(test, 'a/=1'), 'var a; a /= 1;');
}

exports['Compile for in'] = function (test) {
    test.equal(compileCommand(test, 'for a in b: print(a)'), 'var a; forEach(b, function($item) { a = $item; print(a); })');
    test.equal(compileCommand(test, 'for item in [1,2,3]: total += item'), 'var item; var total; forEach([1, 2, 3], function($item) { item = $item; total += item; })');
}

exports['Compile composite with indent'] = function (test) {
    test.equal(compileCommand(test, '\
    n = 1\n\
    total = 1\n\
    while n <= 10:\n\
      total *= n\n\
      n += 1\n\
    print(total)'), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

    test.equal(compileCommand(test, '\
    n = 1\n\
    total = 1\n\
    \n\
    while n <= 10:\n\
      total *= n\n\
      n += 1\n\
    print(total)'), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

    test.equal(compileCommand(test, '\
    n = 1\n\
    total = 1\n\
    \n\
    while n <= 10:\n\
      total *= n\n\
      n += 1\n\
    \n\
    print(total)'), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');
}

exports['Skipping blank lines'] = function (test) {
    // http://docs.python.org/3.3/reference/lexical_analysis.html#blank-lines
    test.equal(compileCommand(test, '\
    n = 1\n\
    total = 1\n\
    \n\
    while n <= 10:\n\
      total *= n\n\
    \n\
    \n\
      n += 1\n\
    \n\
    \n\
    print(total)'), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

    // http://docs.python.org/3.3/reference/lexical_analysis.html#implicit-line-joining

    test.equal(compileExpression(test, '[1,\n2,\n3\n]'), '[1, 2, 3]');
    test.equal(compileExpression(test, '[1,\r\n2,\r\n3\r\n]'), '[1, 2, 3]');
    test.equal(compileExpression(test, '[1\n,2\n,3\n]'), '[1, 2, 3]');
    test.equal(compileExpression(test, '[1, #one \n2, #two \n3 #three\n]'), '[1, 2, 3]');
}

exports['Compile if with pass'] = function (test) {
    test.equal(compileCommand(test, 'if a > 1: pass'), 'if (a > 1) {  }');
}

exports['Compile def'] = function (test) {
    test.equal(compileCommand(test, 'def f(): pass'), 'function f() {  }');
    test.equal(compileCommand(test, 'def f(): print(1)'), 'function f() { print(1); }');
    test.equal(compileCommand(test, 'def f():\n  print(1)\n  print(2)'), 'function f() { print(1); print(2); }');
    test.equal(compileCommand(test, 'def f(a):\n  print(a)'), 'function f(a) { print(a); }');
    test.equal(compileCommand(test, 'def f(a,b):\n  print(a)\n  print(b)'), 'function f(a, b) { print(a); print(b); }');
    test.equal(compileCommand(test, 'def f(\na\n):\n  print(a)'), 'function f(a) { print(a); }');
    test.equal(compileCommand(test, 'def f(\na,\nb\r\n):\n  print(a)\n  print(b)'), 'function f(a, b) { print(a); print(b); }');
}

exports['Compile def with local variables'] = function (test) {
    test.equal(compileCommand(test, 'def f(): a = 1'), 'function f() { var a; a = 1; }');
    test.equal(compileCommand(test, 'def f():\n  a = 1\n  b = 2'), 'function f() { var a; var b; a = 1; b = 2; }');
}

exports['Compile def with local variables and module variables'] = function (test) {
    test.equal(compileCommand(test, 'a = 2; def f(): a = 1'), 'var a; a = 2; function f() { var a; a = 1; }');
    test.equal(compileCommand(test, 'b = 1; def f():\n  a = b'), 'var b; b = 1; function f() { var a; a = b; }');
}
