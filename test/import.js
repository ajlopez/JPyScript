
var py2s = require('../');

exports['import math module'] = function (test) {
    py2s.execute('import math', true);
    var result = py2s.evaluate('math');
    test.ok(result);
    test.ok(result.PI);
    test.ok(result.sin);
    test.ok(result.cos);
    test.ok(result.exp);
    test.ok(result.abs);
    test.equal(typeof result.sin, 'function');
    test.equal(typeof result.cos, 'function');
    test.equal(typeof result.exp, 'function');
    test.equal(typeof result.abs, 'function');
}

exports['import http module'] = function (test) {
    py2s.execute('import http', true);
    var result = py2s.evaluate('http');
    var myhttp = require('http');
    test.ok(result);
    test.strictEqual(result, myhttp);
}

exports['import local file'] = function (test) {
    var original = process.cwd();
    process.chdir(__dirname);
    py2s.execute('import local', true);
    process.chdir(original);
    var result = py2s.evaluate('local');
    test.ok(result);
    test.equal(result.a, 1);
    test.equal(result.b, 2);
    test.equal(result.c, 3);
    test.ok(result.MyClass);
    test.equal(typeof result.MyClass, 'function');
}

