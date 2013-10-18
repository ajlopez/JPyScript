
var py2s = require('../');

exports['Simple'] = function (test) {
    var result = py2s.executeModule('a = 1');
    test.ok(result);
    test.ok(result.a);
    test.equal(result.a, 1);
}

exports['for in'] = function (test) {
    var result = py2s.executeModule('total = 0; for item in [1,2,3]: total += item');
    test.ok(result);
    test.ok(result.total);
    test.equal(result.total, 6);
}

exports['for in string'] = function (test) {
    var result = py2s.executeModule("acum = ''; for letter in 'spam':\n  acum += letter\n  acum += '.'");
    test.ok(result);
    test.ok(result.acum);
    test.equal(result.acum, 's.p.a.m.');
}

exports['while'] = function (test) {
    py2s.execute('total = 0; while total < 10: total += 1', true);
    test.equal(py2s.evaluate('total'), 10);
    test.ok(total);
    test.equal(total, 10);
}
