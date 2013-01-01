
var py2s = require('../'),
    assert = require('assert');

function getToken(text, value, type) {
    var lexer = new Lexer(text);
    var token = lexer.nextToken();
    assert.ok(token);
    assert.equal(token.value, value);
    assert.equal(token.type, type);
    assert.equal(lexer.nextToken(), null);
}

function getNullToken(text) {
    var lexer = new Lexer(text);
    var token = lexer.nextToken();
    assert.equal(token, null);
}

function getTokens(text, values, type) {
    var lexer = new Lexer(text);
    var n = values.length;

    for (var k = 0; k < n; k++) {
        var token = lexer.nextToken();
        assert.ok(token);
        assert.equal(token.value, values[k]);
        assert.equal(token.type, type);
    }

    assert.equal(lexer.nextToken(), null);
}

function getIndent(text, value) {
    var lexer = new Lexer(text);
    assert.equal(lexer.getIndent(), value);
}

// Lexer defined

assert.ok(py2s.Lexer);
assert.ok(py2s.TokenType);

Lexer = py2s.Lexer;
TokenType = py2s.TokenType;

// Get null token

getNullToken(null);
getNullToken('');
getNullToken('  ');
getNullToken('  # a comment');

// Get name token

getToken("spam", "spam", TokenType.Name);

// Get name token with spaces

getToken("  spam  ", "spam", TokenType.Name);

// Get name token with comment

getToken("  spam  # this is a comment", "spam", TokenType.Name);

// Get name token with underscores

getToken("__init__", "__init__", TokenType.Name);

// Get name token with digits

getToken("spam123", "spam123", TokenType.Name);

// Get integer

getToken("123", "123", TokenType.Integer);

// Get integer with spaces

getToken("   123   ", "123", TokenType.Integer);

// Get three names

getTokens("spam foo bar", ["spam", "foo", "bar"], TokenType.Name);

// Get three integers

getTokens("123 456 789", ["123", "456", "789"], TokenType.Integer);

// Get single char operators

getTokens("+-*/.><", ["+", "-", "*", "/", ".", ">", "<"], TokenType.Operator);

// Get two char operators

getTokens("** <= >= == <> !=", ["**", "<=", ">=", "==", "<>", "!="], TokenType.Operator);

// Get assignments

getTokens("= += -= *= /=", ["=", "+=", "-=", "*=", "/="], TokenType.Assignment);

// Get separators

getTokens("()[]{},:;", ["(", ")", "[", "]", "{", "}", ",", ":", ";"], TokenType.Separator);

// Get string

getToken("'spam'", "spam", TokenType.String);
getToken('"spam"', "spam", TokenType.String);

// Get End of Line

getToken('\n', '\n', TokenType.EndOfLine);
getToken('\r', '\r', TokenType.EndOfLine);
getToken('\r\n', '\r\n', TokenType.EndOfLine);
getTokens('\r\n\r\n', ['\r\n', '\r\n'], TokenType.EndOfLine);

// Get indents

getIndent('', 0);
getIndent('  ', 0);
getIndent('\r', 0);
getIndent('\n', 0);
getIndent('\r\n', 0);
getIndent('  \r\n', 0);
getIndent('if', 0);
getIndent('  if', 2);

// http://docs.python.org/3.3/reference/lexical_analysis.html#blank-lines

getIndent('\r\n  if', 2);
getIndent('\n  if', 2);
getIndent('\r\n\r\n  if', 2);
getIndent('\r\n \r\n  if', 2);

// http://docs.python.org/3.3/reference/lexical_analysis.html#explicit-line-joining

getTokens("123\\\n 456\\\n 789\\\n", ["123", "456", "789"], TokenType.Integer);
getTokens("spam\\\n foo\\\n bar\\\n", ["spam", "foo", "bar"], TokenType.Name);

// Get real

getToken('1.23', '1.23', TokenType.Real);
getTokens('1.23 4.56 7.89', ['1.23', '4.56', '7.89'], TokenType.Real);

