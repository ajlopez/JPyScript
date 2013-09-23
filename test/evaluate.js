
var py2s = require('../');

exports['Simple'] = function (test) {
    test.equal(py2s.evaluate('123'), 123);
    test.equal(py2s.evaluate('-123'), -123);
    test.equal(py2s.evaluate('"spam"'), "spam");
}

exports['Arithmetic'] = function (test) {
    test.equal(py2s.evaluate('1+2'), 3);
}

exports['len'] = function (test) {
    test.equal(py2s.evaluate('len("spam")'), 4);
    test.equal(py2s.evaluate('len([1,2,3])'), 3);
}

exports['Index'] = function (test) {
    test.equal(py2s.evaluate('"spam"[0]'), 's');
    test.equal(py2s.evaluate('"spam"[1]'), 'p');
    test.equal(py2s.evaluate('"spam"[-1]'), 'm');
    test.equal(py2s.evaluate('"spam"[-2]'), 'a');
}

exports['Global'] = function (test) {
    test.ok(py2s.evaluate('global'));
    test.equal(py2s.evaluate('global'), global);
}

