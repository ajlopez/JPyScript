
var py2s = require('../');

exports['Simple'] = function (test) {
    py2s.execute('a = 1', true);
    test.equal(py2s.evaluate('a'), 1);
}

exports['for in'] = function (test) {
    py2s.execute('total = 0; for item in [1,2,3]: total += item', true);
    test.equal(py2s.evaluate('total'), 6);
    test.ok(total);
    test.equal(total, 6);

    py2s.execute("acum = ''; for letter in 'spam':\n  acum += letter\n  acum += '.'", true);
    test.equal(py2s.evaluate('acum'), 's.p.a.m.');
    test.ok(acum);
    test.equal(acum, 's.p.a.m.');
}

exports['while'] = function (test) {
    py2s.execute('total = 0; while total < 10: total += 1', true);
    test.equal(py2s.evaluate('total'), 10);
    test.ok(total);
    test.equal(total, 10);
}

exports['new object'] = function (test) {
    py2s.execute('class Foo: pass\na = Foo()', true);
    var result = py2s.evaluate('a');
    test.ok(result);
    test.equal(typeof result, 'object');
}

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

