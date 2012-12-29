
var py2script = (function() {
    var TokenType = { Name: 1, Integer: 2, Real: 3, String: 4, Operator: 5, Separator: 6, EndOfLine: 7, Assignment: 8 };
    var operators = ["+" , "-", "*", "/", ".", ">", "<", "<=", ">=", "!=", "<>", "**", "=="];
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
        }
    }

    function ExpressionCommand(expr) {
        this.compile = function () {
            return expr.compile() + ';';
        }
    }

    function AssignmentCommand(left, expr, oper) {
        oper = oper || '=';
        this.compile = function () {
            return left.compile() + ' ' + oper + ' ' + expr.compile() + ';';
        }
    }

    function IfCommand(cond, thencmd) {
        this.compile = function () {
            return 'if (' + cond.compile() + ') { ' + thencmd.compile() + ' }';
        }
    }

    function WhileCommand(cond, body) {
        this.compile = function () {
            return 'while (' + cond.compile() + ') { ' + body.compile() + ' }';
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
            var token = lexer.nextToken();

            if (token == null)
                return null;            

            if (token.type != TokenType.Name) {
                lexer.pushToken(token);
                return parseExpressionCommand();
            }            

            if (token.value === 'if') {
                var cond = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var cmd = parseSuite(indent);

                return new IfCommand(cond, cmd);
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
                parseEndOfLine();
                var nextindent = lexer.getIndent();
                if (nextindent > newindent)
                    throw "invalid indent";
                if (nextindent < newindent)
                    break;
            }

            return new CompositeCommand(cmds);
        }

        function parseExpressionCommand() {
            return new ExpressionCommand(self.parseExpression());
        }

        function parseExpressionList() {
            var list = [];

            for (var token = lexer.nextToken(); token != null && !(token.type === TokenType.Separator && [')', ']'].indexOf(token.value) >= 0); token = lexer.nextToken()) {
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

            for (var token = lexer.nextToken(); token != null && !(token.type === TokenType.Separator && token.value === '}'); token = lexer.nextToken()) {
                lexer.pushToken(token);
                var key = self.parseExpression();
                parseToken(':', TokenType.Separator);
                var value = self.parseExpression();                
                list.push({ key: key, value: value });
                
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
                
            if (token.type === TokenType.Integer)
                return new IntegerExpression(token.value);
                
            if (token.type === TokenType.Real)
                return new RealExpression(token.value);
                
            if (token.type === TokenType.String)
                return new StringExpression(token.value);
                
            if (token.type === TokenType.Name)
                return new VariableExpression(token.value);

            if (token.type == TokenType.Separator && token.value === "(") {
                var expr = self.parseExpression();
                parseToken(')', TokenType.Separator);
                return new GroupExpression(expr);
            }

            if (token.type == TokenType.Separator && token.value === "[") {
                var exprs = parseExpressionList();
                parseToken(']', TokenType.Separator);
                return new ListExpression(exprs);
            }

            if (token.type == TokenType.Separator && token.value === "{") {
                var keyvalues = parseKeyValueList();
                parseToken('}', TokenType.Separator);

                return new DictionaryExpression(keyvalues);
            }

            if (token.type === TokenType.Operator && token.value === '-')
                return new MinusExpression(parseTerm());
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
        
        function tryParseAssignment() {
            var token = lexer.nextToken();
            
            if (token == null)
                return null;
                
            if (token.type == TokenType.Assignment)
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

        function parseEndOfLine() {
            var token = lexer.nextToken();

            if (token == null)
                return;

            if (token.type == TokenType.EndOfLine)
                return true;

            lexer.pushToken(token);

            throw 'end of line expected';
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

    function isAssignment(ch) {
        return assignments.indexOf(ch) >= 0;
    }

    function isSeparator(ch) {
        return separators.indexOf(ch) >= 0;
    }

    function Runtime() {
        function len(value) {
            return value.length;
        }

        function getIndex(value, index) {
            if (index < 0)
                return value[value.length + index];

            return value[index];
        }

        this.evaluate = function(text) {
            var parser = new Parser(text);
            return eval(parser.parseExpression().compile());
        }
    }

    var runtime = new Runtime();

    function evaluate(text) {
        var parser = new Parser(text);
        return eval(parser.parseExpression().compile());
    }

    return {
        Lexer : Lexer,
        TokenType: TokenType,
        Parser: Parser,
        eval: function (text) { return runtime.evaluate(text); }
    };
})();

if (typeof(window) === 'undefined') {
	module.exports = py2script;
}
