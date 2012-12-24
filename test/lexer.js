
var py2s = require('../'),
    assert = require('assert');
        
// Lexer defined

assert.ok(py2s.Lexer);
assert.ok(py2s.TokenType);

Lexer = py2s.Lexer;
TokenType = py2s.TokenType;

// Get name token

var lexer = new Lexer("spam");
var token = lexer.nextToken();
assert.ok(token);
assert.equal(token.value, "spam");
assert.equal(token.type, TokenType.Name);
assert.equal(lexer.nextToken(), null);

// Get name token with spaces

var lexer = new Lexer("  spam   ");
var token = lexer.nextToken();
assert.ok(token);
assert.equal(token.value, "spam");
assert.equal(token.type, TokenType.Name);
assert.equal(lexer.nextToken(), null);
