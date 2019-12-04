const gelex = require('gelex');

const ldef = gelex.definition();

ldef.defineComment('#');
ldef.define('name', '[a-zA-Z_][a-zA-Z0-9_]*');
ldef.define('real', '[0-9][0-9]*.[0-9][0-9]*');
ldef.define('integer', '[0-9][0-9]*');
ldef.define('operator', '+-*/.><|&'.split(''));
ldef.define('operator', '** <= >= == <> != || &&'.split(' '));
ldef.define('assignment', '= += -= *= /='.split(' '));
ldef.define('delimiter', '()[]{},:;'.split(''));
ldef.defineText('string', '"', '"');
ldef.defineText('string', "'", "'");

const TokenType = { Name: 'name', Integer: 'integer', Real: 'real', String: 'string', Operator: 'operator', Assignment: 'assignment', Delimiter: 'delimiter' };

function createLexer(text) {
    return ldef.lexer(text);
}

module.exports = {
    lexer: createLexer,
    TokenType: TokenType
}

