
var py2script = (function() {
    var TokenType = { Name: 1, Integer: 2, String: 3, Operator: 4, Separator: 5 };
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
        
        this.nextToken = function() {
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
                
            throw "unexpected '" + ch + "'";
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
            while (position < length && isSpace(text[position]))
                position++;
        }
        
        function isSpace(ch) {
            if (ch <= ' ')
                return true;
                
            return false;
        }
    }
    
    function IntegerExpression(value) {
        this.compile = function () {
            return value;
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
    
    function Parser(text) {
        var lexer = new Lexer(text);
        
        this.parseExpression = function () {
            var expr = parseTerm();
            
            if (expr == null)
                return null;
            
            var oper = tryParseOperator();
            
            if (!oper)
                return expr;
                
            return new BinaryExpression(oper, expr, parseTerm());
        }
        
        function parseTerm() {
            var token = lexer.nextToken();
            
            if (token == null)
                return null;
                
            if (token.type == TokenType.Integer)
                return new IntegerExpression(token.value);
                
            if (token.type == TokenType.String)
                return new StringExpression(token.value);
        }
        
        function tryParseOperator() {
            var token = lexer.nextToken();
            
            if (token == null)
                return null;
                
            if (token.type == TokenType.Operator)
                return token.value;
                
            this.lexer.pushToken(token);
            
            return null;
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
