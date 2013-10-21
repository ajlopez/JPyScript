
var jpyscript = (function() {

var jpylexer = (function() {
    var TokenType = { Name: 1, Integer: 2, Real: 3, String: 4, Operator: 5, Separator: 6, EndOfLine: 7, Assignment: 8 };
    var operators = ["+" , "-", "*", "/", ".", ">", "<", "<=", ">=", "!=", "<>", "**", "==", "%", "|", "&", "||", "&&"];
    var assignments = ["=" , "+=", "-=", "*=", "/="];
    var separators = "()[]{},:;";

    function Token(value, type)
    {
        this.value = value;
        this.type = type;
    };

    function Lexer(text) {
        var length = text ? text.length : 0;
        var position = 0;
        var next = [];

        this.nextToken = function() {
            if (next.length)
                return next.pop();

            var ch = nextFirstChar();

            if (ch == null)
                return null;

            if (isNameFirstCharacter(ch))
                return nextName(ch);

            if (isDigit(ch))
                return nextInteger(ch);

            if (isOperator(ch))
                return nextOperator(ch);

            if (isAssignment(ch))
                return nextAssignment(ch);

            if (isSeparator(ch))
                return nextSeparator(ch);

            if (ch === '"' || ch === "'")
                return nextString(ch);

            var ch2 = nextChar();

            if (ch2 && isOperator(ch + ch2))
                return new Token(ch + ch2, TokenType.Operator); 
            else if (ch2 && isAssignment(ch + ch2))
                return new Token(ch + ch2, TokenType.Assignment);
            else
                pushChar(ch2);

            if (isEndOfLine(ch))
                return nextEndOfLine(ch);

            throw "unexpected '" + ch + "'";
        };

        this.pushToken = function (token) {
            if (token)
                next.push(token);
        };

        this.getIndent = function () {
            var indent = 0;
            var ch;
            var pos = position;

            while (pos < length) {
                ch = text[pos];

                if (isEndOfLine(ch)) {
                    indent = 0;
                    pos++;
                    continue;
                }

                if (!isSpace(text[pos]))
                    break;

                indent++;
                pos++;
            }

            if (pos >= length)
                return 0;

            return indent;
        };

        function nextName(letter)
        {
            var name = letter;

            for (var ch = nextChar(); ch && isNameCharacter(ch); ch = nextChar())
                name += ch;

            pushChar(ch);

            return new Token(name, TokenType.Name);
        }

        function nextString(quote)
        {
            var value = '';

            for (var ch = nextChar(); ch && ch != quote; ch = nextChar())
                value += ch;

            return new Token(value, TokenType.String);
        }

        function nextInteger(digit)
        {
            var number = digit;

            for (var ch = nextChar(); ch && isDigit(ch); ch = nextChar())
                number += ch;

            if (ch === '.')
                return nextReal(number + '.');

            pushChar(ch);

            return new Token(number, TokenType.Integer);
        }

        function nextReal(number)
        {
            for (var ch = nextChar(); ch && isDigit(ch); ch = nextChar())
                number += ch;

            pushChar(ch);

            return new Token(number, TokenType.Real);
        }

        function nextEndOfLine(ch)
        {
            if (ch === '\r') {
                var ch2 = nextChar();
                if (ch2 === '\n')
                    ch += ch2;
                else
                    pushChar(ch2);
            }

            return new Token(ch, TokenType.EndOfLine);
        }

        function nextOperator(ch)
        {
            var ch2 = nextChar();
            if (ch2 && !isSpace(ch2) && isOperator(ch + ch2))
                return new Token(ch + ch2, TokenType.Operator);
            else if (ch2 && !isSpace(ch2) && isAssignment(ch + ch2))
                return new Token(ch + ch2, TokenType.Assignment);
            else
                pushChar(ch2);
            return new Token(ch, TokenType.Operator);
        }

        function nextAssignment(ch)
        {
            var ch2 = nextChar();
            if (ch2 && !isSpace(ch2) && isAssignment(ch + ch2))
                return new Token(ch + ch2, TokenType.Assignment);
            else if (ch2 && !isSpace(ch2) && isOperator(ch + ch2))
                return new Token(ch + ch2, TokenType.Operator);
            else
                pushChar(ch2);
            return new Token(ch, TokenType.Assignment);
        }

        function nextSeparator(ch)
        {
            return new Token(ch, TokenType.Separator);
        }

        function pushChar(ch)
        {
            if (ch != null)
                position--;
        }

        function nextChar() {
            while (true) {
                if (position >= length)
                    return null;

                var ch = text[position++];

                if (ch === '\\' && isEndOfLine(text[position])) {
                    if (text[position] == '\n') {
                        position++;
                        continue;
                    }
                    if (text[position] == '\r' && text[position+1] == '\n') {
                        position += 2;
                        continue;
                    }
                }

                if (ch === '#') {
                    for (ch = nextChar(); ch && !isEndOfLine(ch);)
                        ch = nextChar();
                    if (ch)
                        return ch;
                    return null;
                }

                break;
            }

            return ch;
        }

        function nextFirstChar() {
            skipSpaces();
            
            if (position >= length)
                return null;
                
            return nextChar();
        }

        function skipSpaces() {
            for (var ch = nextChar(); ch && isSpace(ch);)
                ch = nextChar();

            if (ch)
                pushChar(ch);
        }

        function isSpace(ch) {
            if (ch <= ' ' && ch !== '\n' && ch !== '\r')
                return true;
                
            return false;
        }

        function isEndOfLine(ch) {
            return ch === '\r' || ch === '\n';
        }
    }

    function isLetter(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }

    function isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }

    function isNameFirstCharacter(ch) {
        return isLetter(ch) || ch === '_';
    }

    function isNameCharacter(ch) {
        return isLetter(ch) || isDigit(ch) || ch === '_';
    }

    function isOperator(ch) {
        return operators.indexOf(ch) >= 0;
    }

    function isAssignment(ch) {
        return assignments.indexOf(ch) >= 0;
    }

    function isSeparator(ch) {
        return separators.indexOf(ch) >= 0;
    }

    return {
        createLexer : function (text) { return new Lexer(text); },
        TokenType: TokenType
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = jpylexer;
}

if (typeof jpylexer === 'undefined')
    var jpylexer = require('./jpylexer');

var jpyparser = (function() {
    var TokenType = jpylexer.TokenType;
    
    function ConstantExpression(value) {
        this.compile = function () {
            return value;
        }
    }

    function MinusExpression(expr) {
        this.compile = function () {
            return '-' + expr.compile();
        }
    }

    function VariableExpression(name) {
        this.compile = function () {
            return name;
        }
        
        this.getName = function () { return name; }
    }

    function GlobalVariableCommand(name) {
        this.compile = function () {
            return '';
        }
        
        this.collectNames = function (names) {
            addGlobalName(name, names);
        }
    }

    function StringExpression(value) {
        var quote = "'";

        if (value && value.indexOf(quote) >= 0)
            quote = '"';

        this.compile = function () {
            return quote + value + quote;
        }
    }

    function DottedExpression(left, right) {
        this.compile = function () {
            return left.compile() + '.' + right.compile();
        }
    }

    function BinaryExpression(oper, left, right) {
        this.compile = function () {
            return left.compile() + ' ' + oper + ' ' + right.compile();
        }
    }

    function CallExpression(func, expressions) {
        var n = expressions.length;

        this.compile = function () {
            var code = func.compile() + '(';

            for (var k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += expressions[k].compile();
            }

            return code + ')';
        }
    }

    function ListExpression(expressions) {
        var n = expressions.length;

        this.compile = function () {
            var code = '[';

            for (var k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += expressions[k].compile();
            }

            return code + ']';
        }
    }

    function DictionaryExpression(keyvalues) {
        var n = keyvalues.length;

        this.compile = function () {
            var code = '{ ';

            for (var k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += keyvalues[k].key.compile() + ': ' + keyvalues[k].value.compile();
            }
            
            if (k)
                code += ' ';

            return code + '}';
        }
    }

    function GroupExpression(expr) {
        this.compile = function () {
            return '(' + expr.compile() + ')';
        }
    }

    function IndexExpression(expr, index) {
        this.compile = function () {
            return expr.compile() + '[' + index.compile() + ']';
        };
    }

    function BreakCommand() {
        this.compile = function () {
            return 'break;';
        };
    }

    function ContinueCommand() {
        this.compile = function () {
            return 'continue;';
        };
    }

    function PassCommand() {
        this.compile = function () {
            return '';
        };
    }

    function ForInCommand(name, expr, cmd) {
        this.compile = function (options) {
            options = options || { };
            var code = '';
            
            if (options.withvars)
                code += compileVars(this, options.names);
                
            code += 'forEach(' + expr.compile() + ', function($item) { ' + name + ' = $item; ' + cmd.compile() + ' });';
            
            return code;
        };
        
        this.collectNames = function (names) {
            addVarName(name, names);
            if (cmd.collectNames)
                cmd.collectNames(names);
        }
    }

    function ExpressionCommand(expr) {
        this.compile = function () {
            return expr.compile() + ';';
        };
    }

    function ReturnCommand(expr) {
        this.compile = function () {
            return 'return ' + expr.compile() + ';';
        };
    }
    
    function ImportCommand(name) {
        this.compile = function (options) {
            options = options || { };
            var code = '';
            
            if (!options.names)
                options.names = { };
            
            if (options.withvars)
                code += compileVars(this, options.names);
            else if (options.exports)
                this.collectNames(options.names);
                
            code += name + " = importModule('" + name + "');";
            
            if (options.exports)
                code += compileExports(options.names);
            
            return code;
        }
        
        this.collectNames = function (names) {
            addVarName(name, names);
        }
    }

    function AssignmentCommand(left, expr, oper) {
        oper = oper || '=';
        
        this.compile = function (options) {
            options = options || { };
            var code = '';
            
            if (!options.names)
                options.names = { };
            
            if (options.withvars)
                code += compileVars(this, options.names);
            else if (options.exports)
                this.collectNames(options.names);
            
            code += left.compile() + ' ' + oper + ' ' + expr.compile() + ';';
            
            if (options.exports)
                code += compileExports(options.names);
            
            return code;
        };
        
        this.collectNames = function (names) {
            if (left.getName)
                addVarName(left.getName(), names);
        }
    }
    
    function AssertCommand(expr) {
        this.compile = function (options) {
            var code = "if (__debug__ && !(" + expr.compile(options) + ")) { throw 'assert error' }";
            return code;
        }
    }
    
    function RaiseCommand(expr) {
        this.compile = function (options) {
            var code = "throw " + expr.compile(options) + ";";
            return code;
        }
    }

    function IfCommand(cond, thencmd, elsecmd) {
        this.compile = function (options) {
            options = options || { };
            var code = '';
            
            if (options.withvars)
                code += compileVars(this, options.names);
                
            code += 'if (' + cond.compile(options) + ') { ' + thencmd.compile(options) + ' }';

            if (elsecmd)
                code += ' else { ' + elsecmd.compile(options) + ' }';
                
            return code;
        };
        
        this.collectNames = function (names) {
            if (thencmd.collectNames)
                thencmd.collectNames(names);
            if (elsecmd && elsecmd.collectNames)
                elsecmd.collectNames(names);
        }
    }

    function WhileCommand(cond, body) {
        this.compile = function (options) {
            options = options || { };
            var code = '';
            
            if (options.withvars)
                code += compileVars(this, options.names);
                
            code += 'while (' + cond.compile() + ') { ' + body.compile() + ' }';
            
            return code;
        }
        
        this.collectNames = function (names) {
            if (body.collectNames)
                body.collectNames(names);
        }
    }

    function DefCommand(name, args, body) {
        var nargs = args.length;

        this.compile = function(options) {
            options = options || { };
            var code = 'function ' + name + '(';
            
            if (options.exports) {
                if (!options.names)
                    options.names = { };
                addDefName(name, args, options.names);
            }

            for (var k = 0; k < nargs; k++) {
                if (k)
                    code += ', ';
                code += args[k];
            }

            code += ') { ' + body.compile({ withvars: true, names: { vars: [], defs: [], args: args.slice() } }) + ' }';
            
            if (options.exports)
                code += compileExports(options.names);

            return code;
        }
        
        this.collectNames = function (names) {
            addDefName(name, args, names);
        }
    }

    function ClassCommand(name, body) {
        this.compile = function(options) {
            options = options || { };
            
            if (!options.names)
                options.names = { };

            if (options.exports)
                addDefName(name, [], options.names);

            var code = 'var ' + name + ' = (function() { var $class = makeClass(__init__); var $obj = $class.obj; var $cons = $class.cons; ';

            var newoptions = { withvars: true, names: { } };
            
            code += body.compile(newoptions);
            
            if (body.collectNames)
                body.collectNames(newoptions.names);
                
            code += compileSelfDefs(newoptions.names);
            
            if (!newoptions.names || !newoptions.names.defs || newoptions.names.defs.indexOf('__init__') < 0)
                code += ' function __init__() { }';
                
            code += ' return $cons;'
            code += ' })();';
            
            if (options.exports)
                code += compileExports(options.names);

            return code;
        }
        
        this.collectNames = function (names) {
            addDefName(name, [], names);
        }
    }

    function CompositeCommand(cmds) {
        var n = cmds.length;
        
        this.compile = function(options) {
            options = options || { };
            var code = '';
            
            if (!options.names)
                options.names = { };
                
            if (options.withvars)
                code += compileVars(this, options.names);
            else if (options.exports)
                this.collectNames(options.names);
            
            for (var k = 0; k < n; k++) {
                if (k && code != '')
                    code += ' ';
                code += cmds[k].compile();
            }
            
            if (options.exports)
                code += compileExports(options.names);
            
            return code;
        }
        
        this.collectNames = function (names) {
            for (var k = 0; k < n; k++)
                if (cmds[k].collectNames)
                    cmds[k].collectNames(names);
        }
    }
    
    function addGlobalName(name, names) {
        if (!names.globals)
            names.globals = [ ];
            
        if (names.globals.indexOf(name) >= 0)
            return;
            
        names.globals.push(name);
    }
    
    function addVarName(name, names) {
        if (names.globals && names.globals.indexOf(name) >= 0)
            return;
            
        if (names.args && names.args.indexOf(name) >= 0)
            return;

        if (names.defs && names.defs.indexOf(name) >= 0)
            return;
            
        if (names.vars && names.vars.indexOf(name) >= 0)
            return;
            
        if (!names.vars)
            names.vars = [ ];
            
        names.vars.push(name);
    }
    
    function addDefName(name, args, names) {
        if (names.globals && names.globals.indexOf(name) >= 0)
            return;
            
        if (names.args && names.args.indexOf(name) >= 0)
            return;

        if (names.defs && names.defs.indexOf(name) >= 0)
            return;
            
        if (names.vars && names.vars.indexOf(name) >= 0)
            return;
            
        if (!names.defs)
            names.defs = [ ];
            
        if (!names.defargs)
            names.defargs = { };
            
        names.defs.push(name);
        names.defargs[name] = args;
    }
    
    function compileExports(names) {
        var code = ' return { ';
        
        for (var k = 0; names.vars && k < names.vars.length; k++) {
            if (k)
                code += ', ';
            code += names.vars[k] + ': ' + names.vars[k];
        }
        
        for (var j = 0; names.defs && j < names.defs.length; j++) {
            if (k + j)
                code += ', ';
            code += names.defs[j] + ': ' + names.defs[j];
        }
        
        code += ' };';
        
        return code;
    }
    
    function compileSelfDefs(names) {
        var code = '';
        
        if (!names || !names.defs || !names.defargs)
            return code;
            
        names.defs.forEach(function (defname) {
            if (!names.defargs[defname] || names.defargs[defname][0] != 'self')
                return;
            
            if (code != '')
                code += ' ';
                
            code += '$cons.' + defname + ' = ' + defname + ';';
            code += ' $obj.prototype.' + defname + ' = function (';
            
            var arglist = '';
            
            for (var k = 1; k < names.defargs[defname].length; k++) {
                if (arglist != '')
                    arglist += ', ';
                arglist += names.defargs[defname][k];
            }
            
            code += arglist + ') { return ' + defname + '(this';
            
            if (arglist != '')
                code += ', ' + arglist;
                
            code += '); };';
        });
        
        return code;
    }
    
    function compileVars(cmd, names) {
        if (!cmd.collectNames)
            return '';
        
        if (!names)
            names = {};
            
        if (!names.vars)
            names.vars = [];
            
        if (!names.defs)
            names.defs = [];
            
        if (!names.args)
            names.args = [];
        
        cmd.collectNames(names);
        
        var code = '';
        
        names.vars.forEach(function(varname) { code += 'var ' + varname + '; ' });
        
        return code;
    }
    
    function Parser(text) {
        var lexer = jpylexer.createLexer(text);
        var self = this;
        var skipnewline = false;

        this.parseExpression = function () {
            var expr = parseSimpleExpression();

            if (expr == null)
                return null;

            for (var oper = tryParseOperator(); oper; oper = tryParseOperator())
                expr = new BinaryExpression(oper, expr, parseSimpleExpression());

            return expr;
        }

        this.parseCommand = function (indent) {
            indent = indent || 0;
            var cmd = parseSimpleCommand(indent);

            if (cmd == null)
                return null;

            var cmds = [ cmd ];

            while (tryParseEndOfCommand()) {
                cmd = parseSimpleCommand(indent);
                if (cmd == null)
                    break;                
                cmds.push(cmd);
            }

            if (cmds.length == 1)
                return cmds[0];

            return new CompositeCommand(cmds);
        }

        function parseSimpleExpression() {
            var expr = parseTerm();

            if (expr == null)
                return null;

            while (true) {
                if (tryParseToken('[', TokenType.Separator)) {
                    var index = self.parseExpression();
                    parseToken(']', TokenType.Separator);
                    
                    expr = new IndexExpression(expr, index);
                }
                else if (tryParseToken('(', TokenType.Separator)) {
                    var exprs = parseExpressionList();
                    parseToken(')', TokenType.Separator);

                    expr = new CallExpression(expr, exprs);
                }
                else if (tryParseToken('.', TokenType.Operator)) {
                    expr = new DottedExpression(expr, parseTerm());
                }
                else
                    break;
            }

            return expr;
        }

        function parseSimpleCommand(indent) {
            var token = nextToken();

            while (token != null && token.type == TokenType.EndOfLine)
                token = nextToken();

            if (token == null)
                return null;            

            if (token.type != TokenType.Name) {
                lexer.pushToken(token);
                return parseExpressionCommand();
            }

            if (token.value === 'break')
                return new BreakCommand();
            if (token.value === 'continue')
                return new ContinueCommand();
            if (token.value === 'pass')
                return new PassCommand();
                
            if (token.value === 'import') {
                var name = parseName();
                return new ImportCommand(name);
            }

            if (token.value === 'def') {
                var name = parseName();
                parseToken('(', TokenType.Separator);
                var originalskip = skipnewline;
                skipnewline = true;
                var names = parseNames();
                parseToken(')', TokenType.Separator);
                skipnewline = originalskip;
                parseToken(':', TokenType.Separator);
                var cmd = parseSuite(indent);
                return new DefCommand(name, names, cmd);
            }
            
            if (token.value === 'class') {
                var name = parseName();
                parseToken(':', TokenType.Separator);
                var cmd = parseSuite(indent);
                return new ClassCommand(name, cmd);
            }
            
            if (token.value === 'return')
                return new ReturnCommand(self.parseExpression());

            if (token.value === 'if') {
                var cond = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var thencmd = parseSuite(indent);
                var elsecmd = null;

                token = nextToken();

                if (token && token.type == TokenType.EndOfLine && lexer.getIndent() === indent && tryParseToken("else", TokenType.Name)) {
                    parseToken(':', TokenType.Separator);
                    elsecmd = parseSuite(indent);
                }
                else
                    lexer.pushToken(token);

                return new IfCommand(cond, thencmd, elsecmd);
            }
            
            if (token.value === 'assert') {
                var expr = self.parseExpression();
                
                return new AssertCommand(expr);
            }
            
            if (token.value === 'raise') {
                var expr = self.parseExpression();
                
                return new RaiseCommand(expr);
            }
            
            if (token.value === 'global' || token.value === 'nonlocal') {
                var name = parseName();
                
                return new GlobalVariableCommand(name);
            }

            if (token.value === 'for') {
                var name = parseName();
                parseToken('in', TokenType.Name);
                var expr = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var cmd = parseSuite(indent);

                return new ForInCommand(name, expr, cmd);
            }

            if (token.value === 'while') {
                var cond = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var cmd = parseSuite(indent);

                return new WhileCommand(cond, cmd);
            }

            lexer.pushToken(token);
            var expr = self.parseExpression();

            var assign = tryParseAssignment();

            if (assign)
                return new AssignmentCommand(expr, self.parseExpression(), assign);

            return new ExpressionCommand(expr);
        }

        function parseSuite(indent) {
            if (tryParseEndOfLine())
                return parseMultiLineSuite(indent);

            return parseSingleLineSuite(indent);
        }

        function parseSingleLineSuite(indent) {
            var cmd = parseSimpleCommand(indent);

            if (!tryParseToken(';', TokenType.Separator))
                return cmd;

            var cmds = [ cmd ];

            for (cmds.push(parseSimpleCommand()); tryParseToken(';', TokenType.Separator); )
                cmds.push(parseSimpleCommand(indent));

            return new CompositeCommand(cmds);
        }

        function parseMultiLineSuite(indent) {
            var cmds = [];
            var newindent = lexer.getIndent();

            if (newindent <= indent)
                throw "invalid indent";

            while (true) {
                cmds.push(parseSingleLineSuite(newindent));
                var token = parseEndOfLine();
                var nextindent = lexer.getIndent();
                if (nextindent > newindent)
                    throw "invalid indent";
                if (nextindent < newindent)
                    break;
            }

            if (token)
                lexer.pushToken(token);

            return new CompositeCommand(cmds);
        }

        function parseExpressionCommand() {
            return new ExpressionCommand(self.parseExpression());
        }

        function parseExpressionList() {
            var list = [];

            for (var token = nextToken(); token != null && !(token.type === TokenType.Separator && [')', ']'].indexOf(token.value) >= 0); token = nextToken()) {
                lexer.pushToken(token);
                var expr = self.parseExpression();
                list.push(expr);
                
                if (!tryParseToken(',', TokenType.Separator))
                    return list;
            }

            if (token == null)
                throw "unexpected end of input";

            lexer.pushToken(token);

            return list;
        }

        function parseKeyValueList() {
            var list = [];

            for (var token = nextToken(); token != null && !(token.type === TokenType.Separator && token.value === '}'); token = nextToken()) {
                lexer.pushToken(token);
                var key = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var value = self.parseExpression();                
                list.push({ key: key, value: value });
                
                if (!tryParseToken(',', TokenType.Separator))
                    return list;
            }

            if (token === null)
                throw "unexpected end of input";

            lexer.pushToken(token);

            return list;
        }
        
        function parseTerm() {
            var token = nextToken();
            
            if (token == null)
                return null;
                
            if (token.type === TokenType.Integer)
                return new ConstantExpression(token.value);
                
            if (token.type === TokenType.Real)
                return new ConstantExpression(token.value);
                
            if (token.type === TokenType.String)
                return new StringExpression(token.value);
                
            if (token.type === TokenType.Name) {
                if (token.value == "None")
                    return new ConstantExpression("null");
                if (token.value == "True")
                    return new ConstantExpression("true");
                if (token.value == "False")
                    return new ConstantExpression("false");
                    
                return new VariableExpression(token.value);
            }

            if (token.type === TokenType.Separator && token.value === "(") {
                var originalskip = skipnewline;
                skipnewline = true;
                var expr = self.parseExpression();
                parseToken(')', TokenType.Separator);
                skipnewline = originalskip;
                return new GroupExpression(expr);
            }

            if (token.type === TokenType.Separator && token.value === "[") {
                var originalskip = skipnewline;
                skipnewline = true;
                var exprs = parseExpressionList();
                parseToken(']', TokenType.Separator);
                skipnewline = originalskip;
                return new ListExpression(exprs);
            }

            if (token.type === TokenType.Separator && token.value === "{") {
                var originalskip = skipnewline;
                skipnewline = true;
                var keyvalues = parseKeyValueList();
                parseToken('}', TokenType.Separator);
                skipnewline = originalskip;
                return new DictionaryExpression(keyvalues);
            }

            if (token.type === TokenType.Operator && token.value === '-')
                return new MinusExpression(parseTerm());
        }
        
        function tryParseOperator() {
            var token = nextToken();
            
            if (token === null)
                return null;
                
            if (token.type === TokenType.Operator)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }
        
        function tryParseAssignment() {
            var token = nextToken();
            
            if (token === null)
                return null;
                
            if (token.type === TokenType.Assignment)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }

        function parseNames() {
            var names = [];

            for (var name = tryParseName(); name; name = tryParseName()) {
                names.push(name);
                if (!tryParseToken(',', TokenType.Separator))
                    break;
            }

            return names;
        }
        
        function tryParseName() {
            var token = nextToken();
            
            if (token === null)
                return null;
                
            if (token.type === TokenType.Name)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }

        function parseName() {
            var token = nextToken();

            if (token !== null && token.type === TokenType.Name)
                return token.value;

            throw "name expected";
        }
        
        function parseToken(value, type) {
            if (!tryParseToken(value, type))
                throw "expected '" + value + "'";
        }
        
        function tryParseEndOfCommand() {
            return tryParseToken(';', TokenType.Separator) || tryParseEndOfLine();
        }

        function parseEndOfLine() {
            var token = nextToken();

            if (token === null)
                return null;

            if (token.type === TokenType.EndOfLine)
                return token;

            lexer.pushToken(token);

            throw 'end of line expected';
        }

        function tryParseEndOfLine() {
            var token = nextToken();

            if (token === null)
                return false;

            if (token.type === TokenType.EndOfLine)
                return true;

            lexer.pushToken(token);

            return false;
        }
        
        function tryParseToken(value, type) {
            var token = nextToken();
            
            if (token === null)
                return false;

            if (token.type === type && token.value === value)
                return true;
                
            lexer.pushToken(token);
            
            return false;
        }

        function nextToken() {
            var token = lexer.nextToken();

            if (skipnewline)
                while (token && token.type == TokenType.EndOfLine)
                    token = lexer.nextToken();

            return token;
        }
    }

    return {
        createParser: function (text) { return new Parser(text); }
    };
})();

if (typeof module !== 'undefined' && module && module.exports)
	module.exports = jpyparser;

if (typeof require != 'undefined') {
    var jpyparser = require('./jpyparser');
    var util = require('util');
    var path = require('path');
    var fs = require('fs');
}

var jpyscript = (function() {
    function evaluate(text) {
        var parser = jpyparser.createParser(text);

        return eval(parser.parseExpression().compile());
    }
    
    function execute(text, novars) {
        var parser = jpyparser.createParser(text);

        var withvars = true;
        
        if (novars)
            withvars = false;
            
        var code = parser.parseCommand().compile({ withvars: withvars });
        return eval(code);
    }

    function executeModule(text) {
        var parser = jpyparser.createParser(text);
        var code = parser.parseCommand().compile({ withvars: true, exports: true });
        return eval('(function () { ' + code + ' })()');
    }

    function getIndex(value, index) {
        if (index < 0)
            return value[value.length + index];

        return value[index];
    }

    function len(value) {
        return value.length;
    }

    function print() {
        var n = arguments.length;
        var np = 0;
        
        for (var k = 0; k < n; k++)
            if (arguments[k] !== null) {
                if (np)
                    util.print(' ');
                util.print(arguments[k]);
                np++;
            }
                
        util.print('\n');
    }
    
    function makeClass(init) {
        function obj() { }

        function cons() {
            var newobj = new obj();
            var initargs = [];
            initargs[0] = newobj;
            
            for (var k = 0; k < arguments.length; k++)
                initargs[k + 1] = arguments[k];
            
            init.apply(null, initargs);
            return newobj;
        }
        
        obj.prototype.__class__ = cons;
        
        return { obj: obj, cons: cons }
    }

    var importcache = { };
    var configuration = { };
    
    if (typeof require != 'undefined')
        configuration.require = require;

    function importModule(name) {
        if (importcache[name])
            return importcache[name];
            
        var filename = name + '.py';
        
        if (fs.existsSync(filename))
            return importFileModule(filename, name);
    
        var filename = path.join(__dirname, 'modules', name + '.py');
        
        if (fs.existsSync(filename))
            return importFileModule(filename, name);

        var result = configuration.require(name);        
        importcache[name] = result;
        
        return result;
    }
    
    function importFileModule(filename, name) {
        var text = fs.readFileSync(filename).toString();
        var result = executeModule(text);
        importcache[name] = result;
        return result;
    }

    function forEach(list, fn) {
        if (list == null)
            return;

        if (typeof list == 'string') {
            var l = list.length;

            for (var k = 0; k < l; k++)
                fn(list[k]);

            return;
        }

        if (list instanceof Array) {
            for (var n in list)
                fn(list[n]);

            return;
        }

        for (var item in list)
            fn(item);
    }
    
    function range(from, to) {
        var result = [];
        
        for (var k = from; k <= to; k++)
            result.push(k);
            
        return result;
    }

    function evaluate(text) {
        var parser = jpyparser.createParser(text);
        return eval(parser.parseExpression().compile());
    }
    
    function configure(conf) {
        Object.keys(conf).forEach(function (key) {
            configuration[key] = conf[key];
        });
        
        if (conf.require)
            require = conf.require;
    }

    return {
        evaluate: evaluate,
        execute: execute,
        executeModule: executeModule,
        configure: configure
    };
})();

if (typeof module !== 'undefined' && module && module.exports)
	module.exports = jpyscript;
    return jpyscript;

})();


// http://coffeescript.org/documentation/docs/browser.html

function runScripts() {
    var scripts = window.document.getElementsByTagName('script');
    
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.type != 'text/python')
            continue;
            
        jpyscript.execute(script.innerHTML, true);
    }
}

if (window.addEventListener)
    window.addEventListener('DOMContentLoaded', runScripts, false);
else
    window.attachEvent('onload', runScripts);