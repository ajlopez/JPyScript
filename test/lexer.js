
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

// Get name token

getToken("spam", "spam", TokenType.Name);

// Get name token with spaces

getToken("  spam  ", "spam", TokenType.Name);

// Get integer

getToken("123", "123", TokenType.Integer);

// Get integer with spaces

getToken("   123   ", "123", TokenType.Integer);

// Get three names

getTokens("spam foo bar", ["spam", "foo", "bar"], TokenType.Name);
