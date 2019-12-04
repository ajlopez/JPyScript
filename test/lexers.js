
const lexers = require('../lib/lexers');

TokenType = lexers.TokenType;

function getToken(test, text, value, type) {
    const lexer = lexers.lexer(text);
    const token = lexer.next();
    test.ok(token);
    test.equal(token.value, value);
    test.equal(token.type, type);
    test.equal(lexer.next(), null);
}

function getNullToken(test, text) {
    const lexer = lexers.lexer(text);
    const token = lexer.next();
    test.equal(token, null);
}

function getTokens(test, text, values, type) {
    const lexer = lexers.lexer(text);
    const n = values.length;

    for (let k = 0; k < n; k++) {
        const token = lexer.next();
        test.ok(token);
        test.equal(token.value, values[k]);
        test.equal(token.type, type);
    }

    test.equal(lexer.next(), null);
}

exports['Lexer defined'] = function (test) {
    test.ok(lexers.lexer);
    test.ok(lexers.TokenType);
}

exports['Get null token'] = function (test) {
    getNullToken(test, null);
    getNullToken(test, '');
    getNullToken(test, '  ');
    getNullToken(test, '  # a comment');
}

exports['Get name token'] = function (test) {
    getToken(test, "spam", "spam", TokenType.Name);
}

exports['Get name token with spaces'] = function (test) {
    getToken(test, "  spam  ", "spam", TokenType.Name);
}

exports['Get name token with comment'] = function (test) {
    getToken(test, "  spam  # this is a comment", "spam", TokenType.Name);
}

exports['Get name token with underscores'] = function (test) {
    getToken(test, "__init__", "__init__", TokenType.Name);
}

exports['Get name token with digits'] = function (test) {
    getToken(test, "spam123", "spam123", TokenType.Name);
}

exports['Get integer'] = function (test) {
    getToken(test, "123", "123", TokenType.Integer);
}

exports['Get integer with spaces'] = function (test) {
    getToken(test, "   123   ", "123", TokenType.Integer);
}

exports['Get three names'] = function (test) {
    getTokens(test, "spam foo bar", ["spam", "foo", "bar"], TokenType.Name);
}

exports['Get three integers'] = function (test) {
    getTokens(test, "123 456 789", ["123", "456", "789"], TokenType.Integer);
}

exports['Get single char operators'] = function (test) {
    getTokens(test, "+-*/.><|&", ["+", "-", "*", "/", ".", ">", "<", "|", "&"], TokenType.Operator);
}

exports['Get two char operators'] = function (test) {
    getTokens(test, "** <= >= == <> != || &&", ["**", "<=", ">=", "==", "<>", "!=", "||", "&&"], TokenType.Operator);
}

exports['Get assignments'] = function (test) {
    getTokens(test, "= += -= *= /=", ["=", "+=", "-=", "*=", "/="], TokenType.Assignment);
}

exports['Get delimiters'] = function (test) {
    getTokens(test, "()[]{},:;", ["(", ")", "[", "]", "{", "}", ",", ":", ";"], TokenType.Delimiter);
}

exports['Get string'] = function (test) {
    getToken(test, "'spam'", "spam", TokenType.String);
    getToken(test, '"spam"', "spam", TokenType.String);
}

exports['Get real'] = function (test) {
    getToken(test, '1.23', '1.23', TokenType.Real);
    getTokens(test, '1.23 4.56 7.89', ['1.23', '4.56', '7.89'], TokenType.Real);
}

