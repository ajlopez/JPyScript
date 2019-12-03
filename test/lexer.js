
const jpylexer = require('../lib/jpylexer');

TokenType = jpylexer.TokenType;

function getToken(test, text, value, type) {
    const lexer = jpylexer.createLexer(text);
    const token = lexer.nextToken();
    test.ok(token);
    test.equal(token.value, value);
    test.equal(token.type, type);
    test.equal(lexer.nextToken(), null);
}

function getNullToken(test, text) {
    const lexer = jpylexer.createLexer(text);
    const token = lexer.nextToken();
    test.equal(token, null);
}

function getTokens(test, text, values, type) {
    const lexer = jpylexer.createLexer(text);
    const n = values.length;

    for (let k = 0; k < n; k++) {
        const token = lexer.nextToken();
        test.ok(token);
        test.equal(token.value, values[k]);
        test.equal(token.type, type);
    }

    test.equal(lexer.nextToken(), null);
}

function getIndent(test, text, value) {
    const lexer = jpylexer.createLexer(text);
    test.equal(lexer.getIndent(), value);
}

exports['Lexer defined'] = function (test) {
    test.ok(jpylexer.createLexer);
    test.ok(jpylexer.TokenType);
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

exports['Get separators'] = function (test) {
    getTokens(test, "()[]{},:;", ["(", ")", "[", "]", "{", "}", ",", ":", ";"], TokenType.Separator);
}

exports['Get string'] = function (test) {
    getToken(test, "'spam'", "spam", TokenType.String);
    getToken(test, '"spam"', "spam", TokenType.String);
}

exports['Get End of Line'] = function (test) {
    getToken(test, '\n', '\n', TokenType.EndOfLine);
    getToken(test, '\r', '\r', TokenType.EndOfLine);
    getToken(test, '\r\n', '\r\n', TokenType.EndOfLine);
    getTokens(test, '\r\n\r\n', ['\r\n', '\r\n'], TokenType.EndOfLine);
}

exports['Get indents'] = function (test) {
    getIndent(test, '', 0);
    getIndent(test, '  ', 0);
    getIndent(test, '\r', 0);
    getIndent(test, '\n', 0);
    getIndent(test, '\r\n', 0);
    getIndent(test, '  \r\n', 0);
    getIndent(test, 'if', 0);
    getIndent(test, '  if', 2);
}

exports['Blank lines'] = function (test) {
// http://docs.python.org/3.3/reference/lexical_analysis.html#blank-lines

    getIndent(test, '\r\n  if', 2);
    getIndent(test, '\n  if', 2);
    getIndent(test, '\r\n\r\n  if', 2);
    getIndent(test, '\r\n \r\n  if', 2);
}

exports['Explicit line joining'] = function (test) {
// http://docs.python.org/3.3/reference/lexical_analysis.html#explicit-line-joining

    getTokens(test, "123\\\n 456\\\n 789\\\n", ["123", "456", "789"], TokenType.Integer);
    getTokens(test, "spam\\\n foo\\\n bar\\\n", ["spam", "foo", "bar"], TokenType.Name);
}

exports['Get real'] = function (test) {
    getToken(test, '1.23', '1.23', TokenType.Real);
    getTokens(test, '1.23 4.56 7.89', ['1.23', '4.56', '7.89'], TokenType.Real);
}
