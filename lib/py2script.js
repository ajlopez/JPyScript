
var py2script = (function() {
    var TokenType = { Name: 1, Integer: 2, String: 3, Operator: 4, Separator: 5, EndOfLine: 6 };
    var operators = "+-*/=.><";
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

            if (isSeparator(ch))
                return nextSeparator(ch);

            if (ch === '"' || ch === "'")
                return nextString(ch);

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
                if (!isSpace(text[pos]))
                    break;
                indent++;
                pos++;
            }

            if (pos < length && isEndOfLine(text[pos]))
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

            pushChar(ch);

            return new Token(number, TokenType.Integer);
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
            return new Token(ch, TokenType.Operator);
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
            if (position >= length)
                return null;
            return text[position++];
        }

        function nextFirstChar() {
            skipSpaces();
            
            if (position >= length)
                return null;
                
            return nextChar();
        }

        function skipSpaces() {
            while (true) {
                while (position < length && isSpace(text[position]))
                    position++;
                if (position >= length)
                    return;
                if (text[position] != '#')
                    return;
                while (position < length && !isEndOfLine(text[position]))
                    position++;
                if (position >= length)
                    return;
            }
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

    function IntegerExpression(value) {
        this.compile = function () {
            return value;
        }
    }

    function VariableExpression(name) {
        this.compile = function () {
            return name;
        }
    }

    function StringExpression(value) {
        this.compile = function () {
            return '"' + value + '"';
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

    function GroupExpression(expr) {
        this.compile = function () {
            return '(' + expr.compile() + ')';
        }
    }

    function ExpressionCommand(expr) {
        this.compile = function () {
            return expr.compile() + ';';
        }
    }

    function AssignmentCommand(name, expr) {
        this.compile = function () {
            return name + ' = ' + expr.compile() + ';';
        }
    }

    function IfCommand(cond, thencmd) {
        this.compile = function () {
            return 'if (' + cond.compile() + ') { ' + thencmd.compile() + ' }';
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
        var lexer = new Lexer(text);
        var self = this;

        this.parseExpression = function () {
            var expr = parseSimpleExpression();

            if (expr == null)
                return null;

            for (var oper = tryParseOperator(); oper; oper = tryParseOperator())
                expr = new BinaryExpression(oper, expr, parseSimpleExpression());

            return expr;
        }

        this.parseCommand = function () {
            var cmd = parseSimpleCommand();

            if (cmd == null)
                return null;

            var cmds = [ cmd ];

            while (tryParseEndOfCommand()) {
                cmd = parseSimpleCommand();
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

            if (!tryParseToken('(', TokenType.Separator))
                return expr;

            var exprs = parseExpressionList();
            parseToken(')', TokenType.Separator);

            return new CallExpression(expr, exprs);
        }

        function parseSimpleCommand() {
            var token = lexer.nextToken();

            if (token == null)
                return null;            

            if (token.type != TokenType.Name) {
                lexer.pushToken(token);
                return parseExpressionCommand();
            }            

            if (token.value == 'if') {
                var cond = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var cmd = parseSuite();

                return new IfCommand(cond, cmd);
            }

            if (!tryParseToken('=', TokenType.Operator)) {
                lexer.pushToken(token);
                return parseExpressionCommand();
            }

            return new AssignmentCommand(token.value, self.parseExpression());
        }

        function parseSuite() {
            if (tryParseEndOfLine())
                return parseMultiLineSuite(0);

            return parseSingleLineSuite();
        }

        function parseSingleLineSuite() {
            var cmd = parseSimpleCommand();

            if (!tryParseToken(';', TokenType.Separator))
                return cmd;

            var cmds = [ cmd ];

            for (cmds.push(parseSimpleCommand()); tryParseToken(';', TokenType.Separator); )
                cmds.push(parseSimpleCommand());

            return new CompositeCommand(cmds);
        }

        function parseMultiLineSuite(indent) {
            var cmds = [];

            for (var newindent = lexer.getIndent(); newindent > indent; newindent = lexer.getIndent())
                cmds.push(parseSingleLineSuite());

            return new CompositeCommand(cmds);
        }

        function parseExpressionCommand() {
            return new ExpressionCommand(self.parseExpression());
        }

        function parseExpressionList() {
            var list = [];

            for (var token = lexer.nextToken(); token != null && token.type != TokenType.Separator; token = lexer.nextToken()) {
                lexer.pushToken(token);
                list.push(self.parseExpression());
                
                if (!tryParseToken(',', TokenType.Separator))
                    return list;
            }

            if (token == null)
                throw "unexpected end of input";

            lexer.pushToken(token);

            return list;
        }
        
        function parseTerm() {
            var token = lexer.nextToken();
            
            if (token == null)
                return null;
                
            if (token.type == TokenType.Integer)
                return new IntegerExpression(token.value);
                
            if (token.type == TokenType.String)
                return new StringExpression(token.value);
                
            if (token.type == TokenType.Name)
                return new VariableExpression(token.value);

            if (token.type == TokenType.Separator && token.value == "(") {
                var expr = self.parseExpression();
                parseToken(')', TokenType.Separator);
                return new GroupExpression(expr);
            }
        }
        
        function tryParseOperator() {
            var token = lexer.nextToken();
            
            if (token == null)
                return null;
                
            if (token.type == TokenType.Operator)
                return token.value;
                
            lexer.pushToken(token);
            
            return null;
        }
        
        function parseToken(value, type) {
            if (!tryParseToken(value, type))
                throw "expected '" + value + "'";
        }
        
        function tryParseEndOfCommand() {
            return tryParseToken(';', TokenType.Separator) || tryParseEndOfLine();
        }

        function tryParseEndOfLine() {
            var token = lexer.nextToken();

            if (token == null)
                return false;

            if (token.type == TokenType.EndOfLine)
                return true;

            lexer.pushToken(token);

            return false;
        }
        
        function tryParseToken(value, type) {
            var token = lexer.nextToken();
            
            if (token == null)
                return false;
                
            if (token.type == type && token.value == value)
                return true;
                
            lexer.pushToken(token);
            
            return false;
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

    function isSeparator(ch) {
        return separators.indexOf(ch) >= 0;
    }

    return {
        Lexer : Lexer,
        TokenType: TokenType,
        Parser: Parser
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = py2script;
}
