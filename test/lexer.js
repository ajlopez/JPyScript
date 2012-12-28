
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

getTokens("+-*/=.><", ["+", "-", "*", "/", "=", ".", ">", "<"], TokenType.Operator);

// Get separators

getTokens("()[]{},:;", ["(", ")", "[", "]", "{", "}", ",", ":", ";"], TokenType.Separator);

// Get string

getToken("'spam'", "spam", TokenType.String);
getToken('"spam"', "spam", TokenType.String);

