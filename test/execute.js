
var py2s = require('../');

exports['Simple'] = function (test) {
    py2s.execute('a = 1');
    test.equal(py2s.evaluate('a'), 1);
}

exports['for in'] = function (test) {
    py2s.execute('total = 0; for item in [1,2,3]: total += item');
    test.equal(py2s.evaluate('total'), 6);
    test.ok(total);
    test.equal(total, 6);

    py2s.execute("acum = ''; for letter in 'spam':\n  acum += letter\n  acum += '.'");
    test.equal(py2s.evaluate('acum'), 's.p.a.m.');
    test.ok(acum);
    test.equal(acum, 's.p.a.m.');
}

exports['while'] = function (test) {
    py2s.execute('total = 0; while total < 10: total += 1');
    test.equal(py2s.evaluate('total'), 10);
    test.ok(total);
    test.equal(total, 10);
}
