
if (typeof jpylexer === 'undefined')
    var jpylexer = require('./jpylexer');

if (typeof util === 'undefined')
    var util = require('util');

var jpyscript = (function() {
    var TokenType = jpylexer.TokenType;
    
    function IntegerExpression(value) {
        this.compile = function () {
            return value;
        }
    }

    function RealExpression(value) {
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
            var code = '{';

            for (var k = 0; k < n; k++) {
                if (k)
                    code += ', ';
                code += keyvalues[k].key.compile() + ': ' + keyvalues[k].value.compile();
            }

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
            return 'getIndex(' + expr.compile() + ', ' + index.compile() + ')';
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
        this.compile = function () {
            return 'forEach(' + expr.compile() + ', function(' + name + ') { ' + cmd.compile() + ' })';
        };
    }

    function ExpressionCommand(expr) {
        this.compile = function () {
            return expr.compile() + ';';
        };
    }

    function AssignmentCommand(left, expr, oper) {
        oper = oper || '=';
        this.compile = function () {
            return code = left.compile() + ' ' + oper + ' ' + expr.compile() + ';';
        };
    }

    function IfCommand(cond, thencmd, elsecmd) {
        this.compile = function () {
            var code = 'if (' + cond.compile() + ') { ' + thencmd.compile() + ' }';
            if (elsecmd)
                code += ' else { ' + elsecmd.compile() + ' }';
            return code;
        };
    }

    function WhileCommand(cond, body) {
        this.compile = function () {
            return 'while (' + cond.compile() + ') { ' + body.compile() + ' }';
        }
    }

    function DefCommand(name, args, body) {
        var nargs = args.length;

        this.compile = function() {
            var code = 'function ' + name + '(';

            for (var k = 0; k < nargs; k++) {
                if (k)
                    code += ', ';
                code += args[k];
            }

            code += ') { ' + body.compile() + ' }';

            return code;
        }
    }

    function CompositeCommand(cmds) {
        var n = cmds.length;
        
        this.compile = function() {
            var code = '';
            
            for (var k = 0; k < n; k++) {
                if (k)
                    code += ' ';
                code += cmds[k].compile();
            }
            
            return code;
        }
    }
    
    function Parser(text) {
        var lexer = new jpylexer.Lexer(text);
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
                return new IntegerExpression(token.value);
                
            if (token.type === TokenType.Real)
                return new RealExpression(token.value);
                
            if (token.type === TokenType.String)
                return new StringExpression(token.value);
                
            if (token.type === TokenType.Name)
                return new VariableExpression(token.value);

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

    function evaluate(text) {
        var parser = new Parser(text);

        return eval(parser.parseExpression().compile());
    }
    
    function execute(text) {
        var parser = new Parser(text);

        return eval(parser.parseCommand().compile());
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
        
        for (var k = 0; k < n; k++)
            if (arguments[k] !== null)
                util.print(arguments[k]);
                
        util.print('\n');
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

    function evaluate(text) {
        var parser = new Parser(text);
        return eval(parser.parseExpression().compile());
    }

    return {
        Parser: Parser,
        evaluate: evaluate,
        execute: execute
    };
})();

if (typeof module !== 'undefined' && module && module.exports)
	module.exports = jpyscript;
