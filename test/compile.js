
var jpyscript = require('..');

exports['Compile expression command'] = function (test) {
    test.equal(jpyscript.compile('"spam"'), "'spam';");
    test.equal(jpyscript.compile('123'), '123;');
    test.equal(jpyscript.compile('1+2'), '1 + 2;');
}

exports['Compile assign command'] = function (test) {
    test.equal(jpyscript.compile('a=1', { withvars: true }), 'var a; a = 1;');
}

exports['Compile return command'] = function (test) {
    test.equal(jpyscript.compile('return 1'), 'return 1;');
}

exports['Compile call command'] = function (test) {
    test.equal(jpyscript.compile('print()'), 'print();');
    test.equal(jpyscript.compile('print(1)'), 'print(1);');
}

exports['Compile composite command'] = function (test) {
    test.equal(jpyscript.compile('print(1);print (2)'), 'print(1); print(2);');
    test.equal(jpyscript.compile('print(1)\nprint (2)'), 'print(1); print(2);');
}

exports['Compile if with single command'] = function (test) {
    test.equal(jpyscript.compile('if a > 1: print(1)'), 'if (a > 1) { print(1); }');
}

exports['Compile if with two commands'] = function (test) {
    test.equal(jpyscript.compile('if a > 1: print(1);print(2)'), 'if (a > 1) { print(1); print(2); }');
}

exports['Compile if with single indented command'] = function (test) {
    test.equal(jpyscript.compile('if a > 1:\n  print(1)'), 'if (a > 1) { print(1); }');    
}

exports['Compile if with two single indented command'] = function (test) {
    test.equal(jpyscript.compile('if a > 1:\n  print(1)\n  print(2)'), 'if (a > 1) { print(1); print(2); }');
}

exports['Compile if with else'] = function (test) {
    test.equal(jpyscript.compile('if a > 1:\n  print(1)\nelse:  print(2)'), 'if (a > 1) { print(1); } else { print(2); }');
}

exports['Compile if with else with indent'] = function (test) {
    test.equal(jpyscript.compile('if a > 1:\n  print(1)\nelse:\n  print(2)'), 'if (a > 1) { print(1); } else { print(2); }');
}

exports['Compile while with single command'] = function (test) {
    test.equal(jpyscript.compile('while a < 10: a=a+1', { withvars: true }), 'var a; while (a < 10) { a = a + 1; }');
}

exports['Compile while with indented commands'] = function (test) {
    test.equal(jpyscript.compile('while a < 10:\n  a=a+1\n  a=a*2', { withvars: true }), 'var a; while (a < 10) { a = a + 1; a = a * 2; }');
}

exports['Compile while with internal if'] = function (test) {
    test.equal(jpyscript.compile('\
    while a < 10:\n\
      a=a+1\n\
      if a == 2:\n\
        print(a)\n\
    ', { withvars: true }), 'var a; while (a < 10) { a = a + 1; if (a == 2) { print(a); } }');
    }

    exports['Compile while with break'] = function (test) {
    test.equal(jpyscript.compile('while a < 10:\n  break'), 'while (a < 10) { break; }');
}

exports['Compile while with continue'] = function (test) {
    test.equal(jpyscript.compile('while a < 10:\n  continue'), 'while (a < 10) { continue; }');
}

exports['Compile extended assignments'] = function (test) {
    test.equal(jpyscript.compile('a+=1', { withvars: true }), 'var a; a += 1;');
    test.equal(jpyscript.compile('a-=1', { withvars: true }), 'var a; a -= 1;');
    test.equal(jpyscript.compile('a*=1', { withvars: true }), 'var a; a *= 1;');
    test.equal(jpyscript.compile('a/=1', { withvars: true }), 'var a; a /= 1;');
}

exports['Compile for in'] = function (test) {
    test.equal(jpyscript.compile('for a in b: print(a)', { withvars: true }), 'var a; forEach(b, function($item) { a = $item; print(a); });');
    test.equal(jpyscript.compile('for item in [1,2,3]: total += item', { withvars: true }), 'var item; var total; forEach([1, 2, 3], function($item) { item = $item; total += item; });');
}

exports['Compile composite with indent'] = function (test) {
    test.equal(jpyscript.compile('\
    n = 1\n\
    total = 1\n\
    while n <= 10:\n\
      total *= n\n\
      n += 1\n\
    print(total)', { withvars: true }), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

    test.equal(jpyscript.compile('\
    n = 1\n\
    total = 1\n\
    \n\
    while n <= 10:\n\
      total *= n\n\
      n += 1\n\
    print(total)', { withvars: true }), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');

    test.equal(jpyscript.compile('\
    n = 1\n\
    total = 1\n\
    \n\
    while n <= 10:\n\
      total *= n\n\
      n += 1\n\
    \n\
    print(total)', { withvars: true }), 'var n; var total; n = 1; total = 1; while (n <= 10) { total *= n; n += 1; } print(total);');
}

exports['Skipping blank lines'] = function (test) {
    // http://docs.python.org/3.3/reference/lexical_analysis.html#blank-lines
    test.equal(jpyscript.compile('\
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
}

exports['Compile if with pass'] = function (test) {
    test.equal(jpyscript.compile('if a > 1: pass'), 'if (a > 1) {  }');
}

exports['Compile def'] = function (test) {
    test.equal(jpyscript.compile('def f(): pass'), 'function f() {  }');
    test.equal(jpyscript.compile('def f(): print(1)'), 'function f() { print(1); }');
    test.equal(jpyscript.compile('def f():\n  print(1)\n  print(2)'), 'function f() { print(1); print(2); }');
    test.equal(jpyscript.compile('def f(a):\n  print(a)'), 'function f(a) { print(a); }');
    test.equal(jpyscript.compile('def f(a,b):\n  print(a)\n  print(b)'), 'function f(a, b) { print(a); print(b); }');
    test.equal(jpyscript.compile('def f(\na\n):\n  print(a)'), 'function f(a) { print(a); }');
    test.equal(jpyscript.compile('def f(\na,\nb\r\n):\n  print(a)\n  print(b)'), 'function f(a, b) { print(a); print(b); }');
}

exports['Compile def with local variables'] = function (test) {
    test.equal(jpyscript.compile('def f(): a = 1'), 'function f() { var a; a = 1; }');
    test.equal(jpyscript.compile('def f():\n  a = 1\n  b = 2'), 'function f() { var a; var b; a = 1; b = 2; }');
}

exports['Compile def with local variables and module variables'] = function (test) {
    test.equal(jpyscript.compile('a = 2; def f(): a = 1'), 'var a; a = 2; function f() { var a; a = 1; }');
    test.equal(jpyscript.compile('b = 1; def f():\n  a = b'), 'var b; b = 1; function f() { var a; a = b; }');
}

exports['Compile def with argument variables'] = function (test) {
    test.equal(jpyscript.compile('def f(a): a = 1'), 'function f(a) { a = 1; }');
    test.equal(jpyscript.compile('def f(a,b):\n  a = b'), 'function f(a, b) { a = b; }');
}

exports['Compile simple import'] = function (test) {
    test.equal(jpyscript.compile('import mymodule'), "var mymodule; mymodule = importModule('mymodule');");
}

exports['Compile require'] = function (test) {
    test.equal(jpyscript.compile("net = require('net')"), "var net; net = require('net');");
}

exports['Compile assert'] = function (test) {
    test.equal(jpyscript.compile("assert a == 1"), "if (__debug__ && !(a == 1)) { throw 'assert error' }"); 
}

exports['Compile raise'] = function (test) {
    test.equal(jpyscript.compile("raise 'error'"), "throw 'error';"); 
}

exports['Compile global with one variable'] = function (test) {
    test.equal(jpyscript.compile("global a\na = 3"), "a = 3;"); 
}

exports['Compile nonlocal with one variable'] = function (test) {
    test.equal(jpyscript.compile("nonlocal a\na = 3"), "a = 3;"); 
}
